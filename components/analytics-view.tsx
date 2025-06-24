'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, TrendingUp, Target, Award } from 'lucide-react'
import { Habit } from '@/lib/types'
import { getHabitEntries } from '@/lib/storage'
import { AIInsights } from './ai-insights'

interface AnalyticsViewProps {
  habits: Habit[]
}

export function AnalyticsView({ habits }: AnalyticsViewProps) {
  const entries = getHabitEntries()
  
  // Get data for the last 30 days
  const getLast30DaysData = () => {
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 29)
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today })
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayEntries = entries.filter(entry => entry.date === dateStr && entry.completed)
      const completionRate = habits.length > 0 ? (dayEntries.length / habits.length) * 100 : 0
      
      return {
        date: format(day, 'MMM dd'),
        completed: dayEntries.length,
        total: habits.length,
        rate: Math.round(completionRate)
      }
    })
  }

  // Get habit completion statistics
  const getHabitStats = () => {
    return habits.map(habit => {
      const habitEntries = entries.filter(entry => entry.habitId === habit.id && entry.completed)
      const totalDays = entries.filter(entry => entry.habitId === habit.id).length || 1
      const completionRate = (habitEntries.length / totalDays) * 100
      
      return {
        name: habit.name,
        completed: habitEntries.length,
        rate: Math.round(completionRate),
        color: habit.color,
        category: habit.category
      }
    })
  }

  // Get category distribution
  const getCategoryData = () => {
    const categoryStats = habits.reduce((acc, habit) => {
      const habitEntries = entries.filter(entry => entry.habitId === habit.id && entry.completed)
      acc[habit.category] = (acc[habit.category] || 0) + habitEntries.length
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryStats).map(([category, count]) => ({
      name: category,
      value: count,
      color: habits.find(h => h.category === category)?.color || '#8884d8'
    }))
  }

  // Get weekly trends
  const getWeeklyTrends = () => {
    const weeks = []
    for (let i = 0; i < 4; i++) {
      const weekStart = subDays(new Date(), (i + 1) * 7)
      const weekEnd = subDays(new Date(), i * 7)
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
      
      const weekEntries = weekDays.flatMap(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        return entries.filter(entry => entry.date === dateStr && entry.completed)
      })
      
      const avgCompletion = habits.length > 0 ? (weekEntries.length / (habits.length * 7)) * 100 : 0
      
      weeks.unshift({
        week: `Week ${4 - i}`,
        completion: Math.round(avgCompletion)
      })
    }
    return weeks
  }

  const last30DaysData = getLast30DaysData()
  const habitStats = getHabitStats()
  const categoryData = getCategoryData()
  const weeklyTrends = getWeeklyTrends()

  const totalCompletions = entries.filter(entry => entry.completed).length
  const averageDaily = last30DaysData.reduce((sum, day) => sum + day.rate, 0) / last30DaysData.length
  const bestStreak = Math.max(...last30DaysData.reduce((streaks, day, index) => {
    if (day.rate === 100) {
      const lastStreak = streaks[streaks.length - 1] || 0
      streaks[streaks.length - 1] = lastStreak + 1
    } else {
      streaks.push(0)
    }
    return streaks
  }, [0]))

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Total Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompletions}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Daily Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageDaily)}%</div>
              <p className="text-xs text-muted-foreground">last 30 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                Best Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bestStreak}</div>
              <p className="text-xs text-muted-foreground">perfect days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Active Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{habits.length}</div>
              <p className="text-xs text-muted-foreground">currently tracking</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Completion Trend */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>30-Day Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last30DaysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Performance */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="completion" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habit Performance */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Habit Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={habitStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} fontSize={12} />
                  <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {habitStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="hsl(var(--chart-1))"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <AIInsights />
      </motion.div>

      {/* Detailed Habit Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detailed Habit Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habitStats.map((habit, index) => (
                <motion.div
                  key={habit.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-muted-foreground">{habit.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{habit.completed} completions</div>
                      <div className="text-sm text-muted-foreground">{habit.rate}% success rate</div>
                    </div>
                    <Badge variant={habit.rate >= 80 ? "default" : habit.rate >= 60 ? "secondary" : "outline"}>
                      {habit.rate >= 80 ? "Excellent" : habit.rate >= 60 ? "Good" : "Needs Work"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}