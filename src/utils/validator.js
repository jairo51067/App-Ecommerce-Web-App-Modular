export function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
export function validPhone(v) { return /^[0-9+\-()\s]{7,}$/.test(v); }