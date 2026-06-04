const express = require('express')
const mongoose = require('mongoose')
const Course = require('../models/Course')
const User = require('../models/User')
const auth = require('../middlewares/auth')
const adminOnly = require('../middlewares/admin')

const router = express.Router()

// Protect all admin routes
router.use(auth, adminOnly)

// ============ COURSES CRUD ============

// GET all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 }).lean()
        res.json({ success: true, courses })
    } catch (err) {
        console.error('Error fetching courses:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET single course
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' })
        }
        const course = await Course.findById(id).lean()
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' })
        }
        res.json({ success: true, course })
    } catch (err) {
        console.error('Error fetching course:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// CREATE new course
router.post('/courses', async (req, res) => {
    console.log('[admin] POST /courses - user:', req.id, 'auth header:', req.headers.authorization)
    console.log('[admin] POST body sample:', { title: req.body.title, slug: req.body.slug, modulesCount: (req.body.modules || []).length })
    try {
        const { title, slug, category, description } = req.body

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Title is required' })
        }
        if (!slug || !slug.trim()) {
            return res.status(400).json({ success: false, message: 'Slug is required' })
        }
        if (!category) {
            return res.status(400).json({ success: false, message: 'Category is required' })
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ success: false, message: 'Description is required' })
        }

        // Normalize modules/lessons: ensure `order` and `id` exist to satisfy schema validators
        const makeId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
        req.body.modules = (req.body.modules || []).map((m, mi) => ({
            id: m.id || m._id || makeId('m'),
            title: m.title || '',
            description: m.description || '',
            xpReward: m.xpReward ?? 100,
            order: (m.order !== undefined && m.order !== null) ? m.order : (mi + 1),
            lessons: (m.lessons || []).map((l, li) => ({
                id: l.id || l._id || makeId('l'),
                title: l.title || 'Untitled lesson',
                duration: l.duration ?? 15,
                xpReward: l.xpReward ?? 20,
                content: (l.content !== undefined && l.content !== null && String(l.content).trim() !== '') ? l.content : '<p></p>',
                videoUrl: l.videoUrl || null,
                resources: l.resources || [],
                order: (l.order !== undefined && l.order !== null) ? l.order : (li + 1),
                quiz: l.quiz || { questions: [] }
            }))
        }))

        // Check if slug already exists
        const existingSlug = await Course.findOne({ slug: slug.toLowerCase().trim() })
        if (existingSlug) {
            return res.status(400).json({ success: false, message: 'Slug already exists' })
        }

        const course = await Course.create({
            ...req.body,
            slug: slug.toLowerCase().trim()
        })
        res.status(201).json({ success: true, course })
    } catch (err) {
        console.error('Error creating course:', err)
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Slug already exists' })
        }
        res.status(500).json({ success: false, message: err.message })
    }
})

// UPDATE course
router.put('/courses/:id', async (req, res) => {
    console.log('[admin] PUT /courses/:id - user:', req.id, 'auth header:', req.headers.authorization)
    console.log('[admin] PUT params:', req.params)
    console.log('[admin] PUT body sample:', { title: req.body.title, slug: req.body.slug, modulesCount: (req.body.modules || []).length })
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' })
        }

        // Normalize incoming modules/lessons so validators don't fail on missing `order`/`id`/`content`
        const makeId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
        req.body.modules = (req.body.modules || []).map((m, mi) => ({
            id: m.id || m._id || makeId('m'),
            title: m.title || '',
            description: m.description || '',
            xpReward: m.xpReward ?? 100,
            order: (m.order !== undefined && m.order !== null) ? m.order : (mi + 1),
            lessons: (m.lessons || []).map((l, li) => ({
                id: l.id || l._id || makeId('l'),
                title: l.title || 'Untitled lesson',
                duration: l.duration ?? 15,
                xpReward: l.xpReward ?? 20,
                content: (l.content !== undefined && l.content !== null && String(l.content).trim() !== '') ? l.content : '<p></p>',
                videoUrl: l.videoUrl || null,
                resources: l.resources || [],
                order: (l.order !== undefined && l.order !== null) ? l.order : (li + 1),
                quiz: l.quiz || { questions: [] }
            }))
        }))

        const { title, slug, category, description } = req.body

        // Validation
        if (title && !title.trim()) {
            return res.status(400).json({ success: false, message: 'Title cannot be empty' })
        }
        if (slug && !slug.trim()) {
            return res.status(400).json({ success: false, message: 'Slug cannot be empty' })
        }
        if (category && !['Savings', 'Investing', 'Budgeting', 'Debt', 'Retirement', 'Tax'].includes(category)) {
            return res.status(400).json({ success: false, message: 'Invalid category' })
        }
        if (description && !description.trim()) {
            return res.status(400).json({ success: false, message: 'Description cannot be empty' })
        }

        // Check if new slug is unique
        if (slug) {
            const existing = await Course.findOne({ slug: slug.toLowerCase().trim(), _id: { $ne: id } })
            if (existing) {
                return res.status(400).json({ success: false, message: 'Slug already exists' })
            }
        }

        const course = await Course.findByIdAndUpdate(
            id,
            {
                ...req.body,
                ...(slug && { slug: slug.toLowerCase().trim() })
            },
            { new: true, runValidators: true }
        )

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' })
        }

        res.json({ success: true, course })
    } catch (err) {
        console.error('Error updating course:', err)
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Slug already exists' })
        }
        res.status(500).json({ success: false, message: err.message })
    }
})

// DELETE course
router.delete('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' })
        }

        const course = await Course.findByIdAndDelete(id)

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' })
        }

        res.json({ success: true, message: 'Course deleted successfully', course })
    } catch (err) {
        console.error('Error deleting course:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// ============ USERS MANAGEMENT ============

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .select('name email xp status isAdmin leaderboardStats createdAt')
            .sort({ createdAt: -1 })
            .lean()
        res.json({ success: true, users })
    } catch (err) {
        console.error('Error fetching users:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET single user
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' })
        }
        const user = await User.findById(id).select('name email xp status isAdmin leaderboardStats createdAt').lean()
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    } catch (err) {
        console.error('Error fetching user:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// ADJUST user XP
router.put('/users/:id/xp', async (req, res) => {
    try {
        const { id } = req.params
        const { op, amount } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' })
        }

        if (!op || !['add', 'deduct'].includes(op)) {
            return res.status(400).json({ success: false, message: 'Invalid operation' })
        }

        const amt = Number(amount) || 0
        if (amt < 0) {
            return res.status(400).json({ success: false, message: 'Amount must be positive' })
        }

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        if (op === 'add') {
            user.xp.totalXP = (user.xp?.totalXP || 0) + amt
            user.xp.currentXP = (user.xp?.currentXP || 0) + amt
        } else if (op === 'deduct') {
            user.xp.currentXP = Math.max(0, (user.xp?.currentXP || 0) - amt)
        }

        await user.save()
        res.json({ success: true, user })
    } catch (err) {
        console.error('Error adjusting user XP:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// BAN/UNBAN user
router.put('/users/:id/ban', async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' })
        }

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        user.status = user.status === 'banned' ? 'active' : 'banned'
        await user.save()

        res.json({ success: true, user, message: `User ${user.status === 'banned' ? 'banned' : 'unbanned'} successfully` })
    } catch (err) {
        console.error('Error banning user:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// RESET user progress
router.put('/users/:id/reset', async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' })
        }

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        user.xp = {
            totalXP: 0,
            currentXP: 0,
            level: 1,
            maxXPForLevel: 7500
        }
        await user.save()

        res.json({ success: true, user, message: 'User progress reset successfully' })
    } catch (err) {
        console.error('Error resetting user:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

module.exports = router
