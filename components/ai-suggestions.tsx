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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Habit Suggestions
          </CardTitle>
          <CardDescription>
            Enable AI features in settings to get personalized habit recommendations
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Habit Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your current habits
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSuggestions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="w-5 h-5 animate-pulse" />
              <span>Generating personalized suggestions...</span>
            </div>
          </div>
        )}

        <AnimatePresence>
          {suggestions.length > 0 && (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: suggestion.color }}
                        />
                        <h4 className="font-medium">{suggestion.name}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                        >
                          {getConfidenceIcon(suggestion.confidence)}
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        {suggestion.reasoning}
                      </p>
                      {suggestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {suggestion.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleAddSuggestion(suggestion)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissSuggestion(suggestion.id)}
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
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No new suggestions at the moment</p>
            <p className="text-sm">Try refreshing or add more habits to get better recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}