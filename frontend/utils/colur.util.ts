export const lightenColor = (hex: string, amount: number): string => {
    return modifyColor(hex, amount);
};

export const darkenColor = (hex: string, amount: number): string => {
    return modifyColor(hex, -amount);
};

const modifyColor = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) + amount * 255;
    let g = ((num >> 8) & 0x00FF) + amount * 255;
    let b = (num & 0x0000FF) + amount * 255;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};
