'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Flame, Target, Calendar, Award, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Habit } from '@/lib/types'
import { getHabits, getHabitEntries } from '@/lib/storage'
import { getToday } from '@/lib/date-utils'

interface HabitStatsProps {
  habits: Habit[]
}

export function HabitStats({ habits }: HabitStatsProps) {
  const entries = getHabitEntries()
  const today = getToday()
  
  const todayEntries = entries.filter(entry => 
    entry.date === today && entry.completed
  )
  
  const completionRate = habits.length > 0 
    ? Math.round((todayEntries.length / habits.length) * 100)
    : 0

  const totalHabits = habits.length
  const completedToday = todayEntries.length
  
  const getOverallStreak = (): number => {
    if (habits.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayEntries = entries.filter(entry => 
        entry.date === dateStr && entry.completed
      )
      
      if (dayEntries.length === habits.length) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const getWeeklyCompletion = (): number => {
    const today = new Date()
    const weekDates: string[] = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      weekDates.push(date.toISOString().split('T')[0])
    }
    
    const weeklyEntries = entries.filter(entry => 
      weekDates.includes(entry.date) && entry.completed
    )
    
    const maxPossible = habits.length * 7
    return maxPossible > 0 ? Math.round((weeklyEntries.length / maxPossible) * 100) : 0
  }

  const getBestCategory = () => {
    const categoryStats = habits.reduce((acc, habit) => {
      const habitEntries = entries.filter(entry => 
        entry.habitId === habit.id && entry.completed
      )
      acc[habit.category] = (acc[habit.category] || 0) + habitEntries.length
      return acc
    }, {} as Record<string, number>)
    
    const bestCategory = Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0]
    return bestCategory ? bestCategory[0] : 'None'
  }

  const weeklyCompletion = getWeeklyCompletion()
  const bestCategory = getBestCategory()
  const perfectDays = getOverallStreak()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full min-h-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <motion.div
                animate={{ rotate: completionRate === 100 ? 360 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <CheckCircle className="w-4 h-4" />
              </motion.div>
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                {completedToday}/{totalHabits}
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                  {completionRate}%
                </Badge>
              </motion.div>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Progress value={completionRate} className="h-2" />
            </motion.div>
            <motion.p 
              className="text-xs text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {completionRate === 100 ? 'Perfect day! 🎉' : `${totalHabits - completedToday} remaining`}
            </motion.p>
          </CardContent>
          <AnimatePresence>
            {completionRate === 100 && (
              <motion.div 
                className="absolute top-2 right-2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <Award className="w-5 h-5 text-yellow-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
      
      <motion.div variants={item}>
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full min-h-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: perfectDays > 0 ? [1, 1.2, 1] : 1,
                  rotate: perfectDays > 0 ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: 1,
                  repeat: perfectDays > 0 ? Infinity : 0,
                  repeatDelay: 2
                }}
              >
                <Flame className="w-4 h-4" />
              </motion.div>
              Perfect Days
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="text-2xl font-bold flex items-center gap-2">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                {perfectDays}
              </motion.span>
              <AnimatePresence>
                {perfectDays > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Flame className="w-5 h-5 text-orange-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.p 
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {perfectDays === 0 ? 'Start your streak today!' : 'consecutive perfect days'}
            </motion.p>
          </CardContent>
          <AnimatePresence>
            {perfectDays >= 7 && (
              <motion.div 
                className="absolute top-2 right-2"
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <TrendingUp className="w-5 h-5 text-green-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
      
      <motion.div variants={item}>
        <Card className="hover:shadow-lg transition-shadow duration-300 h-full min-h-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly Success
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                {weeklyCompletion}%
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="outline">
                  7 days
                </Badge>
              </motion.div>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Progress value={weeklyCompletion} className="h-2" />
            </motion.div>
            <motion.p 
              className="text-xs text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              weekly completion rate
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={item}>
        <Card className="hover:shadow-lg transition-shadow duration-300 h-full min-h-[140px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Target className="w-4 h-4" />
              </motion.div>
              Best Category
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            <motion.div 
              className="text-2xl font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              {totalHabits}
            </motion.div>
            <motion.p 
              className="text-xs text-muted-foreground mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              active habits
            </motion.p>
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              <Badge variant="secondary" className="text-xs">
                Top: {bestCategory}
              </Badge>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}