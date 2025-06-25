'use client'

import { motion } from 'framer-motion'
import { Search, Plus, Settings, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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
        className="flex items-center justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* App Title & Logo */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.div 
            className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 rounded-lg shadow-sm"
            whileHover={{ scale: 1.05, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Calendar className="w-6 h-6 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground whitespace-nowrap">
            HabitFlow
          </h1>
        </motion.div>

        {/* Right-side Controls */}
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={currentView}
            onValueChange={(value) => {
              if (value) onViewChange(value as any)
            }}
            className="hidden sm:flex items-center bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-sm"
          >
            <ToggleGroupItem value="habits" aria-label="Toggle habits">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline ml-2">Habits</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="analytics" aria-label="Toggle analytics">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline ml-2">Analytics</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="history" aria-label="Toggle history">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline ml-2">History</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="settings" aria-label="Toggle settings">
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline ml-2">Settings</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Search and Add for Habits View */}
          {currentView === 'habits' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-40 sm:w-48 md:w-64 bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onAddHabit} size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    <Plus className="w-4 h-4 lg:mr-2" />
                    <span className="hidden lg:inline">Add Habit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add New Habit</p></TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
