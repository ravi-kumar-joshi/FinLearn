import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useDashboardCounts() {
  const [counts, setCounts] = useState({
    courses: 0,
    quizzes: 0,
    users: 0,
    loading: true,
    error: null
  })

  const fetchCounts = useCallback(async () => {
    try {
      setCounts(prev => ({ ...prev, loading: true, error: null }))
      
      const [usersRes, coursesRes, quizzesRes] = await Promise.all([
        api.getUsers().catch(() => ({ users: [] })),
        api.getCourses().catch(() => ({ courses: [] })),
        api.getQuizzes().catch(() => ({ quizzes: [] }))
      ])

      setCounts({
        courses: coursesRes.courses?.length || 0,
        quizzes: quizzesRes.quizzes?.length || 0,
        users: usersRes.users?.length || 0,
        loading: false,
        error: null
      })
    } catch (err) {
      console.error('Error fetching dashboard counts:', err)
      setCounts(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }, [])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  const refresh = useCallback(() => {
    fetchCounts()
  }, [fetchCounts])

  return { ...counts, refresh }
}
