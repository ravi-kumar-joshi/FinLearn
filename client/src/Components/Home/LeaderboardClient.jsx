import React from 'react'
import Leaderboard from '../../admin/components/Leaderboard'
import { useRealtimeLeaderboard } from '../../hooks/useRealtimeXP'

export default function LeaderboardClient() {
    const { topUsers, currentUserRank, loading } = useRealtimeLeaderboard(5, 7000)

    return <Leaderboard users={topUsers} currentUserRank={currentUserRank} loading={loading} />
}
