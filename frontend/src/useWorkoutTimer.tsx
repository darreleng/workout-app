import { useState, useEffect } from 'react';

export function useWorkoutTimer(createdAt: string | undefined | null) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!createdAt) return;

        const startTime = new Date(createdAt).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const diffInSeconds = Math.floor((now - startTime) / 1000);
            setSeconds(diffInSeconds > 0 ? diffInSeconds : 0);
        };

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);

    }, [createdAt]);

    return seconds;
}