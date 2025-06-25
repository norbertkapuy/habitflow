'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Habit } from '@/lib/types'
import { getHabitEntries } from '@/lib/storage'

interface HistoryViewProps {
  habits: Habit[]
  selectedHabitId?: string | null
}

export function HistoryView({ habits, selectedHabitId }: HistoryViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedHabit, setSelectedHabit] = useState<string | null>(selectedHabitId || null)
  
  // Update selectedHabit when selectedHabitId prop changes
  useEffect(() => {
    if (selectedHabitId) {
      setSelectedHabit(selectedHabitId)
    }
  }, [selectedHabitId])
  
  const entries = getHabitEntries()
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }
  
  const getHabitEntryForDate = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return entries.find(entry => entry.habitId === habitId && entry.date === dateStr)
  }
  
  const getDayCompletionStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayEntries = entries.filter(entry => entry.date === dateStr && entry.completed)
    const total = habits.length
    const completed = dayEntries.length
    
    if (total === 0) return { status: 'none', percentage: 0, completed: 0, total: 0 }
    
    const percentage = (completed / total) * 100
    let status = 'poor'
    if (percentage === 100) status = 'perfect'
    else if (percentage >= 80) status = 'great'
    else if (percentage >= 60) status = 'good'
    else if (percentage > 0) status = 'partial'
    
    return { status, percentage: Math.round(percentage), completed, total }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect': return 'bg-green-500'
      case 'great': return 'bg-green-400'
      case 'good': return 'bg-yellow-400'
      case 'partial': return 'bg-orange-400'
      case 'poor': return 'bg-red-300'
      default: return 'bg-muted'
    }
  }
  
  const filteredHabits = selectedHabit ? habits.filter(h => h.id === selectedHabit) : habits
  
  return (
    <TooltipProvider>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Habit History - {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Habit Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Habit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedHabit === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedHabit(null)}
            >
              All Habits
            </Button>
            {habits.map(habit => (
              <Button
                key={habit.id}
                variant={selectedHabit === habit.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedHabit(habit.id)}
                className="gap-2"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                {habit.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <motion.div 
            className="grid grid-cols-7 gap-2"
            layout
          >
            {monthDays.map((date, index) => {
              const dayStatus = getDayCompletionStatus(date)
              const isToday = isSameDay(date, new Date())
              
              return (
                <Tooltip key={date.toISOString()}>
                  <TooltipTrigger asChild>
                    <motion.div
                      className={`
                        relative p-2 rounded-lg border cursor-pointer transition-all hover:scale-105
                        ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                        ${!isSameMonth(date, currentDate) ? 'opacity-30' : ''}
                      `}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      whileHover={{ y: -2 }}
                    >
                      {/* Day Number */}
                      <div className="text-sm font-medium text-center mb-1">
                        {format(date, 'd')}
                      </div>
                      
                      {/* Completion Indicator */}
                      <div className="space-y-1">
                        {selectedHabit === null ? (
                          /* Overall completion indicator */
                          <div className="flex items-center justify-center">
                            <div 
                              className={`w-6 h-6 rounded-full ${getStatusColor(dayStatus.status)} flex items-center justify-center`}
                            >
                              {dayStatus.status === 'perfect' && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                              {dayStatus.status === 'poor' && dayStatus.completed === 0 && (
                                <XCircle className="w-3 h-3 text-white" />
                              )}
                              {dayStatus.status !== 'perfect' && dayStatus.status !== 'poor' && (
                                <span className="text-xs font-bold text-white">
                                  {dayStatus.percentage}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Single habit indicator */
                          <div className="flex items-center justify-center">
                            {(() => {
                              const entry = getHabitEntryForDate(selectedHabit, date)
                              const completed = entry?.completed || false
                              return (
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  completed 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-border bg-muted'
                                }`}>
                                  {completed ? (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  {selectedHabit === null && (
                    <TooltipContent>
                      <p>{dayStatus.completed}/{dayStatus.total} completed</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedHabit === null ? (
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm">Perfect Day (100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-400" />
                <span className="text-sm">Great Day (80-99%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400" />
                <span className="text-sm">Good Day (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-400" />
                <span className="text-sm">Partial Day (1-59%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-300" />
                <span className="text-sm">No Habits (0%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-muted border-2 border-border" />
                <span className="text-sm">No Data</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-muted border-2 border-border" />
                <span className="text-sm">Not Completed</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const monthEntries = entries.filter(entry => {
                const entryDate = new Date(entry.date)
                return isSameMonth(entryDate, currentDate) && entry.completed
              })
              
              const totalPossible = monthDays.filter(day => isSameMonth(day, currentDate)).length * 
                                  (selectedHabit ? 1 : habits.length)
              const completed = selectedHabit 
                ? monthEntries.filter(entry => entry.habitId === selectedHabit).length
                : monthEntries.length
              
              const percentage = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0
              
              const perfectDays = monthDays.filter(day => {
                if (!isSameMonth(day, currentDate)) return false
                const dayStatus = getDayCompletionStatus(day)
                return selectedHabit 
                  ? getHabitEntryForDate(selectedHabit, day)?.completed || false
                  : dayStatus.status === 'perfect'
              }).length
              
              return (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="text-sm text-muted-foreground">Overall Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{completed}</div>
                    <div className="text-sm text-muted-foreground">Total Completions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{perfectDays}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedHabit ? 'Completed Days' : 'Perfect Days'}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </TooltipProvider>
  )
}