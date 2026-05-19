/**
 * Get Leaderboard Controller
 * 
 * Fetches top-ranked users based on XP and other metrics
 * Supports pagination and different sorting options
 * 
 * @module controllers/getLeaderboard
 * @requires ../models/User
 */

const User = require("../models/User");

/**
 * Get Top Ranked Users for Leaderboard
 * 
 * Features:
 * - Fetch top users sorted by total XP
 * - Support pagination
 * - Include current user's rank
 * - Mock data generation for testing
 * 
 * @async
 * @function getLeaderboard
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.limit=10] - Number of users to fetch
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {string} [req.query.sortBy='xp'] - Sort by 'xp', 'level', 'streak'
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Leaderboard data with top users and current user's rank
 * 
 * @example
 * GET /user/leaderboard?limit=20&page=1&sortBy=xp
 * 
 * Response:
 * {
 *   success: true,
 *   topUsers: [
 *     {
 *       rank: 1,
 *       name: 'John Doe',
 *       totalXP: 45000,
 *       level: 12,
 *       completedCourses: 15,
 *       streak: 21
 *     }
 *   ],
 *   currentUserRank: 5,
 *   pagination: { page: 1, limit: 10, total: 150 }
 * }
 */
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, page = 1, sortBy = 'xp' } = req.query;
        const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (pageNum - 1) * limitNum;

        // Define sort options
        const sortOptions = {
            xp: { 'xp.totalXP': -1 },
            level: { 'xp.level': -1, 'xp.totalXP': -1 },
            streak: { 'leaderboardStats.streak': -1, 'xp.totalXP': -1 },
        };

        const sortOption = sortOptions[sortBy] || sortOptions.xp;

        // Fetch top users with selected sorting
        const topUsers = await User.find(
            { 'xp.totalXP': { $gt: 0 } }, // Only users with XP
            'name email xp leaderboardStats profileImage'
        )
            .sort(sortOption)
            .limit(limitNum)
            .skip(skip);

        // Add rank to each user
        const rankedUsers = topUsers.map((user, index) => ({
            rank: skip + index + 1,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            totalXP: user.xp?.totalXP || 0,
            currentXP: user.xp?.currentXP || 0,
            level: user.xp?.level || 1,
            completedCourses: user.leaderboardStats?.completedCourses || 0,
            completionRate: user.leaderboardStats?.completionRate || 0,
            achievements: user.leaderboardStats?.achievementCount || 0,
            streak: user.leaderboardStats?.streak || 0,
        }));

        // Get total user count
        const totalUsers = await User.countDocuments({ 'xp.totalXP': { $gt: 0 } });

        // Get current user's rank if user is authenticated
        let currentUserRank = null;
        let currentUserData = null;

        if (req.user && req.user._id) {
            const currentUser = await User.findById(
                req.user._id,
                'name email xp leaderboardStats profileImage'
            );

            if (currentUser && currentUser.xp?.totalXP > 0) {
                const usersBetter = await User.countDocuments({
                    'xp.totalXP': { $gt: currentUser.xp.totalXP }
                });
                currentUserRank = usersBetter + 1;

                currentUserData = {
                    rank: currentUserRank,
                    name: currentUser.name,
                    email: currentUser.email,
                    profileImage: currentUser.profileImage,
                    totalXP: currentUser.xp?.totalXP || 0,
                    currentXP: currentUser.xp?.currentXP || 0,
                    level: currentUser.xp?.level || 1,
                    completedCourses: currentUser.leaderboardStats?.completedCourses || 0,
                    completionRate: currentUser.leaderboardStats?.completionRate || 0,
                    achievements: currentUser.leaderboardStats?.achievementCount || 0,
                    streak: currentUser.leaderboardStats?.streak || 0,
                };
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Leaderboard fetched successfully',
            topUsers: rankedUsers,
            currentUserRank: currentUserData,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limitNum),
            },
            sortBy: sortBy,
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard',
            error: error.message,
        });
    }
};

module.exports = getLeaderboard;
