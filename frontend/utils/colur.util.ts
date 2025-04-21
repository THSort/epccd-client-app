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

export const setColorAlpha = (hex: string, alpha: number): string => {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    const cleanHex = hex.replace('#', '');

    let r: number, g: number, b: number;

    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    } else {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
};
