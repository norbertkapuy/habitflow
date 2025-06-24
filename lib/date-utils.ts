export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getToday(): string {
  return formatDate(new Date())
}

export function getDaysInRange(startDate: Date, days: number): string[] {
  const result: string[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    result.push(formatDate(date))
  }
  return result
}

export function getWeekDates(): string[] {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  return getDaysInRange(startOfWeek, 7)
}

export function getDayName(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}