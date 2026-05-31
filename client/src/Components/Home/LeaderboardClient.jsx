import React from 'react'
import Leaderboard from '../../admin/components/Leaderboard'
import { useRealtimeLeaderboard } from '../../hooks/useRealtimeXP'

export default function LeaderboardClient() {
    const { topUsers, currentUserRank, loading } = useRealtimeLeaderboard(5, 7000)

    console.log("TOP USERS:", topUsers)
    console.log("CURRENT RANK:", currentUserRank)
    console.log("LOADING:", loading)

    return <Leaderboard users={topUsers} currentUserRank={currentUserRank} loading={loading} />
}
