'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Flame, Target, Calendar, Edit, Trash, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Habit, HabitEntry } from '@/lib/types'
import { getWeekDates, getDayName, getToday } from '@/lib/date-utils'
import { toggleHabitEntry, getHabitEntry, deleteHabit } from '@/lib/storage'
import { EditHabitForm } from './edit-habit-form'

interface HabitCardProps {
  habit: Habit
  onUpdate: () => void
  onViewHistory?: (habitId: string) => void
}

const getCategoryIcon = (category: string) => {
  const icons = {
    Health: '🏥',
    Fitness: '💪',
    Mindfulness: '🧘',
    Productivity: '⚡',
    Learning: '📚',
    Finance: '💰',
    Social: '👥',
    Home: '🏠',
    Creative: '🎨',
    Other: '📝'
  }
  return icons[category as keyof typeof icons] || '📝'
}

export function HabitCard({ habit, onUpdate, onViewHistory }: HabitCardProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const weekDates = getWeekDates()
  const today = getToday()

  const handleToggle = (date: string) => {
    toggleHabitEntry(habit.id, date)
    onUpdate()
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`)) {
      deleteHabit(habit.id)
      onUpdate()
    }
  }

  const isCompleted = (date: string): boolean => {
    const entry = getHabitEntry(habit.id, date)
    return entry?.completed || false
  }

  const getStreak = (): number => {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      if (isCompleted(dateStr)) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const getWeekProgress = (): number => {
    const completedDays = weekDates.filter(date => isCompleted(date)).length
    return (completedDays / weekDates.length) * 100
  }

  const completedThisWeek = weekDates.filter(date => isCompleted(date)).length

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
        className="mb-3"
      >
        <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              {/* Icon and Title */}
              <div className="flex items-center gap-3">
                <motion.div 
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-lg flex-shrink-0" 
                  style={{ backgroundColor: habit.color + '20', color: habit.color }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {getCategoryIcon(habit.category)}
                </motion.div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-semibold truncate">{habit.name}</CardTitle>
                    <AnimatePresence>
                      {getStreak() > 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Flame className="w-4 h-4 text-orange-500" />
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getStreak()} day streak!</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-sm h-5 px-2 font-medium">
                      {getStreak()}d streak
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">
                      {completedThisWeek}/{weekDates.length} this week
                    </span>
                  </div>
                </div>
              </div>

              {/* Days in a row */}
              <div className="flex gap-2 flex-1 justify-center">
                {weekDates.map((date, index) => {
                  const completed = isCompleted(date)
                  const isToday = date === today
                  const dayName = getDayName(date)
                  
                  return (
                    <Tooltip key={date}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.03 * index }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center justify-center cursor-pointer w-14 h-14 rounded-lg border transition-colors ${
                            isToday 
                              ? 'border-primary bg-primary/10' 
                              : completed 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                          onClick={() => handleToggle(date)}
                        >
                          <span className={`text-sm font-semibold ${
                            isToday ? 'text-primary' : completed ? 'text-white' : 'text-muted-foreground'
                          }`}>
                            {dayName.charAt(0)}
                          </span>
                          
                          <AnimatePresence mode="wait">
                            {completed ? (
                              <motion.div
                                key="completed"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="incomplete"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className={`w-2 h-2 rounded-full ${
                                  isToday ? 'bg-primary' : 'bg-muted-foreground/40'
                                }`}
                              />
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{completed ? 'Completed' : 'Mark as completed'} - {dayName}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* Menu */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom" sideOffset={8} alignOffset={-4}>
                    <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit habit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewHistory?.(habit.id)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      View history
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete habit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <AnimatePresence>
        {showEditForm && (
          <EditHabitForm
            habit={habit}
            onClose={() => setShowEditForm(false)}
            onUpdate={onUpdate}
          />
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}