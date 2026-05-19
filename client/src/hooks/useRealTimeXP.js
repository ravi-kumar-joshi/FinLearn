import { useEffect, useState, useRef, useCallback } from 'react';
import httpAction from '../utils/httpAction';
import apis from '../utils/apis';

export const useRealtimeXP = (pollInterval = 5000) => {
    const [userData, setUserData] = useState(null);
    const [xpHistory, setXpHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pollTimerRef = useRef(null);
    const previousXpRef = useRef(0);
    const isMountedRef = useRef(true); // ✅ Memory leak fix

    const fetchUserData = useCallback(async () => {
        try {
            const res = await httpAction({ url: apis().getUserProfile });

            if (!isMountedRef.current) return; // ✅ Unmount ke baad state set na ho

            if (res?.status && res.user) {
                const currentXp = res.user?.xp?.totalXP || 0;

                if (previousXpRef.current !== 0 && previousXpRef.current !== currentXp) {
                    setXpHistory(prev => [
                        ...prev.slice(-19),
                        {
                            timestamp: new Date(),
                            xp: currentXp,
                            change: currentXp - previousXpRef.current
                        }
                    ]);
                }
                previousXpRef.current = currentXp;
                setUserData(res.user);
                setError(null);
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err.message || 'Failed to fetch user data');
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        fetchUserData();
        pollTimerRef.current = setInterval(fetchUserData, pollInterval);

        return () => {
            isMountedRef.current = false;
            clearInterval(pollTimerRef.current);
        };
    }, [fetchUserData, pollInterval]);

    const refreshNow = useCallback(() => fetchUserData(), [fetchUserData]);

    return { userData, xpHistory, loading, error, refreshNow };
};

export const useRealtimeLeaderboard = (limit = 10, pollInterval = 8000) => {
    const [topUsers, setTopUsers] = useState([]);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pollTimerRef = useRef(null);
    const isMountedRef = useRef(true);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await httpAction({
                url: `${apis().getLeaderboard}?limit=${limit}`,
                method: 'GET'
            });

            if (!isMountedRef.current) return;

            if (res?.topUsers) {
                setTopUsers(res.topUsers);
                setCurrentUserRank(res.currentUserRank ?? null);
                setError(null);
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err.message || 'Failed to fetch leaderboard');
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchLeaderboard();
        pollTimerRef.current = setInterval(fetchLeaderboard, pollInterval);

        return () => {
            isMountedRef.current = false;
            clearInterval(pollTimerRef.current);
        };
    }, [fetchLeaderboard, pollInterval]);

    const refreshNow = useCallback(() => fetchLeaderboard(), [fetchLeaderboard]);

    return { topUsers, currentUserRank, loading, error, refreshNow };
};