export const normalizeScore = (raw: number): number => {
    const centered = (raw - 5) / 5;
    const compressed = centered * 0.7;
    return Math.round(Math.max(1, Math.min(9, 5 + compressed * 5)));
};
