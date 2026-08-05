const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatMonthYear(value: string): string {
  if (value === 'Present') return value

  const [year, month] = value.split('-')
  const monthName = MONTHS[Number(month) - 1] ?? ''
  return `${monthName} ${year}`.trim()
}
