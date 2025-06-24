'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Habit } from '@/lib/types'
import { getHabits, saveHabits } from '@/lib/storage'
import { HabitCard } from './habit-card'
import { AddHabitForm } from './add-habit-form'
import { HabitStats } from './habit-stats'
import { HabitHeader } from './habit-header'
import { AnalyticsView } from './analytics-view'
import { HistoryView } from './history-view'
import { SettingsView } from './settings-view'
import { AISuggestions } from './ai-suggestions'
import { AIInsights } from './ai-insights'
import { notificationService } from '@/lib/notifications'

type ViewMode = 'habits' | 'analytics' | 'history' | 'settings'

export function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentView, setCurrentView] = useState<ViewMode>('habits')
  const [selectedHabitForHistory, setSelectedHabitForHistory] = useState<string | null>(null)

  const loadHabits = () => {
    setHabits(getHabits())
    setLoading(false)
  }

  useEffect(() => {
    loadHabits()
    
    // Initialize notification service
    try {
      // The notification service is already initialized as a singleton when imported
      // But we can trigger setup for existing habits if needed
      console.log('Notification service initialized')
    } catch (error) {
      console.error('Error initializing notification service:', error)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-8 h-8 border-b-2 border-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const activeHabits = habits.filter(habit => habit.isActive)
  
  const filteredHabits = activeHabits.filter(habit =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'analytics':
        return <AnalyticsView habits={activeHabits} />
      case 'history':
        return <HistoryView habits={activeHabits} selectedHabitId={selectedHabitForHistory} />
      case 'settings':
        return <SettingsView />
      default:
        return (
          <>
            {activeHabits.length > 0 && <HabitStats habits={activeHabits} />}
            
            <AddHabitForm 
              onHabitAdded={loadHabits} 
              isOpen={showAddForm}
              onOpenChange={setShowAddForm}
            />
            
            {habits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first habit to start building better routines!
                </p>
              </div>
            ) : filteredHabits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No habits found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search term or create a new habit.
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {searchTerm ? `Search Results (${filteredHabits.length})` : 'Your Habits'}
                  </h2>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Clear search
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {filteredHabits.map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                    >
                      <HabitCard
                        habit={habit}
                        onUpdate={loadHabits}
                        onViewHistory={(habitId) => {
                          setSelectedHabitForHistory(habitId)
                          setCurrentView('history')
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {/* AI components moved to bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AISuggestions onAddHabit={(habit) => {
                const newHabit: Habit = {
                  id: `habit-${Date.now()}`,
                  ...habit,
                  createdAt: new Date(),
                  isActive: true
                }
                const updatedHabits = [...habits, newHabit]
                saveHabits(updatedHabits)
                setHabits(updatedHabits)
              }} />
              {activeHabits.length > 0 && <AIInsights />}
            </div>
          </>
        )
    }
  }

  return (
    <div className="space-y-6">
      <HabitHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddHabit={() => setShowAddForm(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}