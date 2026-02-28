export const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
        return `${pad(minutes)}:${pad(seconds)}`;
};

export const formatSeconds = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const hourLabel = hours === 1 ? 'hour' : 'hours';
    const minLabel = minutes === 1 ? 'min' : 'mins';

    if (hours < 1) {
        return minutes > 0 ? `${minutes} ${minLabel}` : '0 mins';
    }

    if (minutes === 0) {
        return `${hours} ${hourLabel}`;
    }

    return `${hours} ${hourLabel} ${minutes} ${minLabel}`;
};