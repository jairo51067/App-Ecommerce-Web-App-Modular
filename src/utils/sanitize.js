export function sanitize(str) {
  return String(str || '').replace(/[<>]/g, '');
}