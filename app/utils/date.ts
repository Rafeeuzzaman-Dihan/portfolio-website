const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatMonthYear(value: string): string {
  if (value === 'Present') return value

  const [year, month] = value.split('-')
  const monthName = MONTHS[Number(month) - 1] ?? ''
  return `${monthName} ${year}`.trim()
}

// Whole months from start to end, counting both ends ("2025-01" to "2025-03" is 3).
// "Present" counts up to the current month.
export function monthsBetween(start: string, end: string): number {
  const [startYear, startMonth] = start.split('-').map(Number)
  const now = new Date()
  const [endYear, endMonth] = end === 'Present'
    ? [now.getFullYear(), now.getMonth() + 1]
    : end.split('-').map(Number)
  return (endYear! - startYear!) * 12 + (endMonth! - startMonth!) + 1
}
