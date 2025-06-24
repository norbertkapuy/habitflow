'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Plus, X, RefreshCw, Brain, Target, TrendingUp } from 'lucide-react'
import { Habit, HabitEntry, AIHabitSuggestion } from '@/lib/types'
import AIService from '@/lib/ai-service'
import { getHabits, getHabitEntries, saveHabits } from '@/lib/storage'

interface AISuggestionsProps {
  onAddHabit?: (habit: Omit<Habit, 'id' | 'createdAt' | 'isActive'>) => void
  className?: string
}

export function AISuggestions({ onAddHabit, className }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AIHabitSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const settings = AIService.getSettings()
    console.log('🤖 AI Settings:', settings)
    
    const enabled = settings.enabled && settings.apiKey.length > 0
    setIsEnabled(enabled)
    
    if (enabled && settings.autoSuggestions) {
      console.log('🤖 Auto-loading suggestions...')
      loadSuggestions()
    } else {
      console.log('🤖 AI not enabled or auto-suggestions disabled:', { 
        enabled: settings.enabled, 
        hasApiKey: settings.apiKey.length > 0, 
        autoSuggestions: settings.autoSuggestions 
      })
    }
  }, [])

  const loadSuggestions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const habits = getHabits()
      const entries = getHabitEntries()
      const recentEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return entryDate >= thirtyDaysAgo
      })

      console.log('🤖 Loading AI suggestions...', { 
        habitsCount: habits.length, 
        entriesCount: entries.length, 
        recentEntriesCount: recentEntries.length 
      })

      const aiSuggestions = await AIService.generateHabitSuggestions(habits, recentEntries)
      
      console.log('🤖 AI suggestions loaded:', aiSuggestions)
      setSuggestions(aiSuggestions)
    } catch (err) {
      console.error('🤖 AI suggestions failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load AI suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuggestion = (suggestion: AIHabitSuggestion) => {
    const newHabit = {
      name: suggestion.name,
      description: suggestion.description,
      category: suggestion.category,
      color: suggestion.color
    }

    if (onAddHabit) {
      onAddHabit(newHabit)
    } else {
      const habits = getHabits()
      const habit: Habit = {
        id: `habit-${Date.now()}`,
        ...newHabit,
        createdAt: new Date(),
        isActive: true
      }
      saveHabits([...habits, habit])
    }

    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <Target className="w-3 h-3" />
    if (confidence >= 0.6) return <TrendingUp className="w-3 h-3" />
    return <Brain className="w-3 h-3" />
  }

  if (!isEnabled) {
    return (
      <Card className={`${className} border-dashed border-2 border-muted-foreground/25`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Sparkles className="w-4 h-4 text-purple-500" />
            AI Suggestions
          </CardTitle>
          <CardDescription className="text-xs">
            Enable AI in settings for recommendations
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-purple-500" />
            AI Suggestions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSuggestions}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 max-h-32 overflow-y-auto">
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 mb-2 p-2 bg-red-50 dark:bg-red-950 rounded-md">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Brain className="w-4 h-4 animate-pulse" />
              <span>Generating suggestions...</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {suggestions.length > 0 && (
            <div className="space-y-2 pr-1">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-md p-2 bg-background/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: suggestion.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <h4 className="font-medium text-sm truncate">{suggestion.name}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs h-4 px-1 ${getConfidenceColor(suggestion.confidence)}`}
                          >
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAddSuggestion(suggestion)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissSuggestion(suggestion.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {!loading && suggestions.length === 0 && !error && (
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">No suggestions available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}