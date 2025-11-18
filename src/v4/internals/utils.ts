export function unescape(RegExp: string): string {
  return RegExp.replace(/\\([.*+?^${}()|[\]\\])/g, '$1')
}

export function lcm<T extends bigint | number>(a: T, b: T): T {
  return ((a * b) / gcd(a, b)) as T
}

export function gcd<T extends bigint | number>(a: T, b: T): T {
  return b === 0n || b === 0 ? a : gcd(b, (a % b) as T)
}
