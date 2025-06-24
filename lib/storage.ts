import { Habit, HabitEntry } from './types'

const HABITS_KEY = 'habits'
const ENTRIES_KEY = 'habit_entries'

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(HABITS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

export function getHabitEntries(): HabitEntry[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(ENTRIES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveHabitEntries(entries: HabitEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Habit {
  const habits = getHabits()
  const newHabit: Habit = {
    ...habit,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  habits.push(newHabit)
  saveHabits(habits)
  return newHabit
}

export function toggleHabitEntry(habitId: string, date: string): void {
  const entries = getHabitEntries()
  const existingEntry = entries.find(e => e.habitId === habitId && e.date === date)
  
  if (existingEntry) {
    existingEntry.completed = !existingEntry.completed
  } else {
    entries.push({
      id: Date.now().toString(),
      habitId,
      date,
      completed: true,
    })
  }
  
  saveHabitEntries(entries)
}

export function getHabitEntry(habitId: string, date: string): HabitEntry | undefined {
  const entries = getHabitEntries()
  return entries.find(e => e.habitId === habitId && e.date === date)
}

export function deleteHabit(habitId: string): void {
  const habits = getHabits()
  const entries = getHabitEntries()
  
  // Remove the habit
  const updatedHabits = habits.filter(habit => habit.id !== habitId)
  saveHabits(updatedHabits)
  
  // Remove all entries for this habit
  const updatedEntries = entries.filter(entry => entry.habitId !== habitId)
  saveHabitEntries(updatedEntries)
}