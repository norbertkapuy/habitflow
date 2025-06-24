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
    Learning: '📚',
    Work: '💼',
    Personal: '👤',
    Social: '👥',
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
        className="mb-4"
      >
        <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-lg" 
                  style={{ backgroundColor: habit.color + '20', color: habit.color }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {getCategoryIcon(habit.category)}
                </motion.div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {habit.name}
                    <AnimatePresence>
                      {getStreak() > 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              whileHover={{ scale: 1.2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
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
                  </CardTitle>
                  {habit.description && (
                    <motion.p 
                      className="text-sm text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {habit.description}
                    </motion.p>
                  )}
                  <motion.div 
                    className="flex items-center gap-2 mt-2"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Progress value={getWeekProgress()} className="h-2 flex-1" />
                    <motion.span 
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {completedThisWeek}/{weekDates.length} this week
                    </motion.span>
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge variant="secondary" className="gap-1">
                    <Target className="w-3 h-3" />
                    {habit.category}
                  </Badge>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge variant="outline" className="gap-1">
                    <Flame className="w-3 h-3" />
                    {getStreak()} day{getStreak() !== 1 ? 's' : ''}
                  </Badge>
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </motion.div>
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
          </CardHeader>
          
          <CardContent>
            <motion.div 
              className="flex gap-2 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
            >
              {weekDates.map((date, index) => {
                const completed = isCompleted(date)
                const isToday = date === today
                const dayName = getDayName(date)
                
                return (
                  <Tooltip key={date}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ 
                          scale: 1.1, 
                          y: -2,
                          transition: { type: "spring", stiffness: 400, damping: 10 }
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer w-16 h-20 ${
                          isToday 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                            : completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-border hover:border-primary/30'
                        }`}
                        onClick={() => handleToggle(date)}
                      >
                        <span className={`text-xs font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>
                          {dayName}
                        </span>
                        <AnimatePresence mode="wait">
                          {completed ? (
                            <motion.div
                              key="completed"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            >
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="incomplete"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary/50"
                              whileHover={{ borderColor: habit.color }}
                            />
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{completed ? 'Completed' : 'Mark as completed'} - {date}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </motion.div>
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