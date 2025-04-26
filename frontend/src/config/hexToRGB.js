const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string' || hex.charAt(0) !== '#') return [1, 1, 1]; // Повертаємо білий за замовчуванням
    const bigint = parseInt(hex.substring(1), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [r, g, b];
};

export default hexToRgb;