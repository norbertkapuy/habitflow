'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Brain, 
  RefreshCw, 
  Calendar,
  BarChart3,
  Users,
  Lightbulb
} from 'lucide-react'
import { Habit, HabitEntry, AIInsight, AIAnalysisRequest } from '@/lib/types'
import AIService from '@/lib/ai-service'
import { getHabits, getHabitEntries } from '@/lib/storage'

interface AIInsightsProps {
  className?: string
}

export function AIInsights({ className }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [activeTimeframe, setActiveTimeframe] = useState<'week' | 'month' | 'quarter'>('month')
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'correlations' | 'predictions'>('overview')

  useEffect(() => {
    const settings = AIService.getSettings()
    setIsEnabled(settings.enabled && settings.apiKey.length > 0)
    
    if (settings.enabled && settings.weeklyInsights) {
      loadInsights('insights')
    }
  }, [activeTimeframe])

  const loadInsights = async (analysisType: 'insights' | 'correlations' | 'predictions') => {
    setLoading(true)
    setError(null)
    
    try {
      const habits = getHabits()
      const entries = getHabitEntries()

      const request: AIAnalysisRequest = {
        habits,
        entries,
        timeframe: activeTimeframe,
        analysisType
      }

      const aiInsights = await AIService.generateInsights(request)
      
      if (analysisType === 'insights') {
        setInsights(aiInsights)
      } else {
        setInsights(prev => [...prev.filter(i => i.type !== analysisType.slice(0, -1)), ...aiInsights])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'pattern':
        return <BarChart3 className="w-4 h-4" />
      case 'suggestion':
        return <Lightbulb className="w-4 h-4" />
      case 'correlation':
        return <Users className="w-4 h-4" />
      case 'prediction':
        return <Target className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'pattern':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'suggestion':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'correlation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'prediction':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const groupedInsights = insights.reduce((acc, insight) => {
    acc[insight.type] = acc[insight.type] || []
    acc[insight.type].push(insight)
    return acc
  }, {} as Record<string, AIInsight[]>)

  if (!isEnabled) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Enable AI features in settings to get intelligent habit analysis
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
              <Brain className="w-5 h-5 text-purple-500" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Intelligent analysis of your habit patterns and performance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg">
              {(['week', 'month', 'quarter'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={activeTimeframe === timeframe ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTimeframe(timeframe)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadInsights('insights')}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
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
              <span>Analyzing your habits...</span>
            </div>
          </div>
        )}

        <div className="w-full">
          <div className="flex border-b mb-4">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'patterns', label: 'Patterns' },
              { key: 'correlations', label: 'Correlations' },
              { key: 'predictions', label: 'Predictions' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveTab(tab.key as any)
                  if (tab.key === 'correlations') loadInsights('correlations')
                  if (tab.key === 'predictions') loadInsights('predictions')
                }}
                className={`rounded-none border-b-2 ${
                  activeTab === tab.key 
                    ? 'border-primary text-primary' 
                    : 'border-transparent'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4 mt-4">
              <AnimatePresence>
                {insights.slice(0, 5).map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getInsightColor(insight.type)}>
                          {getInsightIcon(insight.type)}
                          {insight.type}
                        </Badge>
                        <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {insight.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-4 mt-4">
              <AnimatePresence>
                {groupedInsights.pattern?.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </motion.div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No patterns detected yet</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'correlations' && (
            <div className="space-y-4 mt-4">
              <AnimatePresence>
                {groupedInsights.correlation?.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </motion.div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No correlations found yet</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-4 mt-4">
              <AnimatePresence>
                {groupedInsights.prediction?.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" />
                        <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </motion.div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No predictions available yet</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {!loading && insights.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No insights available yet</p>
            <p className="text-sm">Keep tracking your habits to generate intelligent insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}