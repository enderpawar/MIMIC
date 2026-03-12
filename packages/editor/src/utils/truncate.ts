export function truncate(value: string, maxLength = 24): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
