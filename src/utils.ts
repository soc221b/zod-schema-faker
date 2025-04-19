export function unescape(RegExp: string): string {
  return RegExp.replace(/\\([.*+?^${}()|[\]\\])/g, '$1')
}
