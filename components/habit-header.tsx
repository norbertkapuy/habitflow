'use client'

import { motion } from 'framer-motion'
import { Search, Plus, Settings, Calendar, BarChart3, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface HabitHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddHabit: () => void
  currentView: 'habits' | 'analytics' | 'history' | 'settings'
  onViewChange: (view: 'habits' | 'analytics' | 'history' | 'settings') => void
}

export function HabitHeader({ searchTerm, onSearchChange, onAddHabit, currentView, onViewChange }: HabitHeaderProps) {
  return (
    <TooltipProvider>
      <motion.div 
        className="flex flex-col gap-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* App Title */}
        <div className="text-center">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 rounded-xl shadow-sm"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Calendar className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              HabitFlow
            </motion.h1>
          </motion.div>
          <motion.p 
            className="text-muted-foreground text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transform your daily routines into lasting change
          </motion.p>
        </div>
        
        {/* Main Navigation */}
        <motion.div 
          className="max-w-6xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Navigation Tabs */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-1.5 shadow-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentView === 'habits' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('habits')}
                    className={`relative transition-all duration-200 ${
                      currentView === 'habits' 
                        ? 'bg-background text-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Habits
                    {currentView === 'habits' && (
                      <motion.div
                        className="absolute inset-0 bg-primary/5 rounded-md"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View and manage your habits</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentView === 'analytics' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('analytics')}
                    className={`relative transition-all duration-200 ${
                      currentView === 'analytics' 
                        ? 'bg-background text-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                    <Badge variant="secondary" className="ml-2 text-xs bg-green-600 text-white dark:bg-green-500 dark:text-green-950 font-medium">
                      AI
                    </Badge>
                    {currentView === 'analytics' && (
                      <motion.div
                        className="absolute inset-0 bg-primary/5 rounded-md"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View analytics, charts, and AI insights</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentView === 'history' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('history')}
                    className={`relative transition-all duration-200 ${
                      currentView === 'history' 
                        ? 'bg-background text-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    History
                    {currentView === 'history' && (
                      <motion.div
                        className="absolute inset-0 bg-primary/5 rounded-md"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View habit history calendar</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentView === 'settings' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('settings')}
                    className={`relative transition-all duration-200 ${
                      currentView === 'settings' 
                        ? 'bg-background text-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                    {currentView === 'settings' && (
                      <motion.div
                        className="absolute inset-0 bg-primary/5 rounded-md"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>App settings and preferences</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
          
          {/* Search and Quick Actions for Habits View */}
          {currentView === 'habits' && (
            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3 bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-sm max-w-2xl w-full">
                {/* Search Field */}
                <motion.div 
                  className="relative flex-1"
                  initial={{ width: "60%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search habits by name, category, or description..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary/30 text-foreground placeholder:text-muted-foreground/70"
                  />
                </motion.div>
                
                {/* Add Habit Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={onAddHabit} 
                        size="default"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Habit
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new habit to track</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </motion.div>
          )}

          {/* Quick Stats for Analytics View */}
          {currentView === 'analytics' && (
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/50 dark:border-purple-800/30 rounded-xl px-4 py-2">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  AI-Powered Insights Available
                </span>
                <Badge variant="secondary" className="text-xs bg-green-600 text-white dark:bg-green-500 dark:text-green-950 font-medium">
                  Free
                </Badge>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}