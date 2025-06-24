import { Habit, HabitEntry } from './types'

interface LocalStorageData {
  habits: Habit[]
  entries: HabitEntry[]
  settings?: any
}

class MigrationService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  
  // Check if migration is needed
  static needsMigration(): boolean {
    if (typeof window === 'undefined') return false
    
    const hasLocalData = localStorage.getItem('habits') || localStorage.getItem('habitEntries')
    const hasMigrated = localStorage.getItem('migratedToDatabase')
    
    return !!hasLocalData && !hasMigrated
  }

  // Get all data from localStorage
  static getLocalStorageData(): LocalStorageData {
    if (typeof window === 'undefined') {
      return { habits: [], entries: [] }
    }

    const habits: Habit[] = JSON.parse(localStorage.getItem('habits') || '[]')
    const entries: HabitEntry[] = JSON.parse(localStorage.getItem('habitEntries') || '[]')
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')

    return { habits, entries, settings }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.error('Database health check failed:', response.status)
        return false
      }
      
      const result = await response.json()
      return result.status === 'healthy'
    } catch (error) {
      console.error('Error testing database connection:', error)
      return false
    }
  }

  // Migrate habits to database
  static async migrateHabits(habits: Habit[]): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] }
    
    for (const habit of habits) {
      try {
        const response = await fetch(`${this.API_BASE_URL}/habits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: habit.name,
            description: habit.description,
            category: habit.category,
            color: habit.color,
            isActive: habit.isActive
          })
        })

        if (response.ok) {
          results.success++
        } else {
          const error = await response.json()
          results.errors.push(`Failed to migrate habit "${habit.name}": ${error.message}`)
        }
      } catch (error) {
        results.errors.push(`Error migrating habit "${habit.name}": ${error}`)
      }
    }
    
    return results
  }

  // Get habit ID mapping (old ID -> new ID)
  static async getHabitIdMapping(localHabits: Habit[]): Promise<Map<string, string>> {
    const mapping = new Map<string, string>()
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/habits`)
      if (!response.ok) {
        throw new Error('Failed to fetch habits from database')
      }
      
      const result = await response.json()
      const dbHabits = result.data
      
      // Match habits by name and category
      for (const localHabit of localHabits) {
        const dbHabit = dbHabits.find((h: any) => 
          h.name === localHabit.name && h.category === localHabit.category
        )
        if (dbHabit) {
          mapping.set(localHabit.id, dbHabit.id)
        }
      }
    } catch (error) {
      console.error('Error getting habit ID mapping:', error)
    }
    
    return mapping
  }

  // Migrate habit entries to database
  static async migrateEntries(entries: HabitEntry[], habitMapping: Map<string, string>): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] }
    
    // Prepare entries with new habit IDs
    const mappedEntries = entries
      .filter(entry => habitMapping.has(entry.habitId))
      .map(entry => ({
        habitId: habitMapping.get(entry.habitId)!,
        date: entry.date,
        completed: entry.completed
      }))

    if (mappedEntries.length === 0) {
      return results
    }

    try {
      // Bulk create entries
      const response = await fetch(`${this.API_BASE_URL}/entries/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entries: mappedEntries })
      })

      if (response.ok) {
        const result = await response.json()
        results.success = result.count || mappedEntries.length
      } else {
        const error = await response.json()
        results.errors.push(`Failed to migrate entries: ${error.message}`)
      }
    } catch (error) {
      results.errors.push(`Error migrating entries: ${error}`)
    }
    
    return results
  }

  // Full migration process
  static async migrate(): Promise<{
    success: boolean
    message: string
    details: {
      habits: { success: number; errors: string[] }
      entries: { success: number; errors: string[] }
    }
  }> {
    try {
      // Check connection
      const isConnected = await this.testConnection()
      if (!isConnected) {
        return {
          success: false,
          message: 'Cannot connect to database. Please check if the backend is running.',
          details: { habits: { success: 0, errors: [] }, entries: { success: 0, errors: [] } }
        }
      }

      // Get local data
      const localData = this.getLocalStorageData()
      
      if (localData.habits.length === 0) {
        return {
          success: true,
          message: 'No data to migrate.',
          details: { habits: { success: 0, errors: [] }, entries: { success: 0, errors: [] } }
        }
      }

      // Migrate habits
      const habitResults = await this.migrateHabits(localData.habits)
      
      // Get habit ID mapping for entries
      const habitMapping = await this.getHabitIdMapping(localData.habits)
      
      // Migrate entries
      const entryResults = await this.migrateEntries(localData.entries, habitMapping)

      // Mark migration as complete
      if (typeof window !== 'undefined') {
        localStorage.setItem('migratedToDatabase', 'true')
        localStorage.setItem('migrationDate', new Date().toISOString())
        
        // Optionally backup local data before clearing
        const backup = {
          habits: localData.habits,
          entries: localData.entries,
          settings: localData.settings,
          migratedAt: new Date().toISOString()
        }
        localStorage.setItem('localDataBackup', JSON.stringify(backup))
      }

      const totalSuccess = habitResults.success + entryResults.success
      const totalErrors = [...habitResults.errors, ...entryResults.errors]

      return {
        success: totalErrors.length === 0,
        message: totalErrors.length === 0 
          ? `Successfully migrated ${habitResults.success} habits and ${entryResults.success} entries to database.`
          : `Migration completed with some errors. Migrated ${habitResults.success} habits and ${entryResults.success} entries. ${totalErrors.length} errors occurred.`,
        details: {
          habits: habitResults,
          entries: entryResults
        }
      }
    } catch (error) {
      console.error('Migration failed:', error)
      return {
        success: false,
        message: `Migration failed: ${error}`,
        details: { habits: { success: 0, errors: [] }, entries: { success: 0, errors: [] } }
      }
    }
  }

  // Clear local storage after successful migration
  static clearLocalStorage(): void {
    if (typeof window === 'undefined') return
    
    const keysToRemove = ['habits', 'habitEntries', 'habitStreaks']
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  // Restore from backup (if needed)
  static restoreFromBackup(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const backup = localStorage.getItem('localDataBackup')
      if (!backup) return false
      
      const data = JSON.parse(backup)
      
      localStorage.setItem('habits', JSON.stringify(data.habits))
      localStorage.setItem('habitEntries', JSON.stringify(data.entries))
      if (data.settings) {
        localStorage.setItem('settings', JSON.stringify(data.settings))
      }
      
      // Remove migration flags
      localStorage.removeItem('migratedToDatabase')
      localStorage.removeItem('migrationDate')
      
      return true
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return false
    }
  }

  // Check migration status
  static getMigrationStatus(): {
    hasMigrated: boolean
    migrationDate?: string
    hasBackup: boolean
    needsMigration: boolean
  } {
    if (typeof window === 'undefined') {
      return { hasMigrated: false, hasBackup: false, needsMigration: false }
    }
    
    return {
      hasMigrated: !!localStorage.getItem('migratedToDatabase'),
      migrationDate: localStorage.getItem('migrationDate') || undefined,
      hasBackup: !!localStorage.getItem('localDataBackup'),
      needsMigration: this.needsMigration()
    }
  }
}

export default MigrationService 