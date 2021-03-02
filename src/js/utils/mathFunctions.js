// map number x from range [a, b] to [c, d]
export const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;
// linear interpolation
export const lerp = (a, b, n) => (1 - n) * a + n * b;
// normalization
export const norm = (value, min, max) => (value - min) / (max - min);
// clamp
export const clamp = (x, min, max) =>  Math.min(Math.max(x, min), max);