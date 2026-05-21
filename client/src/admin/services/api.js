const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'https://finlearn-1.onrender.com' : '/')

async function request(path, opts = {}) {
  const token = localStorage.getItem('adminToken')
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}${path}`, {
    credentials: 'include',
    headers,
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

// Courses
export async function getCourses()               { return request('/admin/courses') }
export async function createCourse(payload)      { return request('/admin/courses',      { method: 'POST',   body: JSON.stringify(payload) }) }
export async function updateCourse(id, payload)  { return request(`/admin/courses/${id}`, { method: 'PUT',    body: JSON.stringify(payload) }) }
export async function deleteCourse(id)           { return request(`/admin/courses/${id}`, { method: 'DELETE' }) }

// Users
export async function getUsers()                           { return request('/admin/users') }
export async function adjustUserXP(id, op, amount)         { return request(`/admin/users/${id}/xp`,    { method: 'PUT', body: JSON.stringify({ op, amount }) }) }
export async function toggleBanUser(id)                    { return request(`/admin/users/${id}/ban`,   { method: 'PUT' }) }
export async function resetUser(id)                        { return request(`/admin/users/${id}/reset`, { method: 'PUT' }) }
export async function getLeaderboard(limit = 10)           { return request(`/user/leaderboard?limit=${limit}`) }

// Auth
export async function login(email, password) {
  const data = await request('/user/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  if (data?.token) localStorage.setItem('adminToken', data.token)
  return data
}
export async function logout() {
  try { await request('/user/logout') } catch (_) { /* best-effort */ }
  finally { localStorage.removeItem('adminToken') }
}

export default { getCourses, createCourse, updateCourse, deleteCourse, getUsers, adjustUserXP, toggleBanUser, resetUser, getLeaderboard, login, logout }