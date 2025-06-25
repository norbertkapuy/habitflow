'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'suggestion':
        return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'correlation':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'prediction':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      default:
        return 'bg-muted/50 text-muted-foreground border-border'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.6) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const groupedInsights = insights.reduce((acc, insight) => {
    acc[insight.type] = acc[insight.type] || []
    acc[insight.type].push(insight)
    return acc
  }, {} as Record<string, AIInsight[]>)

  if (!isEnabled) {
    return (
      <Card className={`${className} border-dashed border-2 border-muted-foreground/25`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Brain className="w-4 h-4 text-purple-500" />
            AI Insights
          </CardTitle>
          <CardDescription className="text-xs">
            Enable AI in settings for analysis
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
            <Brain className="w-4 h-4 text-purple-500" />
            AI Insights
          </CardTitle>
          <div className="flex items-center gap-1">
            <div className="flex border rounded-md">
              {(['week', 'month', 'quarter'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={activeTimeframe === timeframe ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTimeframe(timeframe)}
                  className="rounded-none first:rounded-l-md last:rounded-r-md h-6 px-2 text-xs"
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadInsights('insights')}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
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
              <span>Analyzing...</span>
            </div>
          </div>
        )}

        <div className="w-full pr-1">
          <Tabs 
            value={activeTab} 
            onValueChange={(value: string) => {
              setActiveTab(value as 'overview' | 'patterns' | 'correlations' | 'predictions')
              if (value === 'patterns') loadInsights('correlations')
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-7 mb-2">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="patterns" className="text-xs">Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-2 space-y-2">
              <AnimatePresence>
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-md p-2 bg-background/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className={`${getInsightColor(insight.type)} text-xs h-4 px-1 border`}>
                          {getInsightIcon(insight.type)}
                          {insight.type}
                        </Badge>
                        <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm mb-0.5">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{insight.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="patterns" className="mt-2 space-y-2">
              <AnimatePresence>
                {groupedInsights.pattern?.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-md p-2 bg-background/50"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <BarChart3 className="w-3 h-3 text-blue-500" />
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-0.5">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{insight.description}</p>
                  </motion.div>
                )) || (
                  <div className="text-center py-4 text-muted-foreground">
                    <BarChart3 className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No patterns detected</p>
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>

        {!loading && insights.length === 0 && !error && (
          <div className="text-center py-4 text-muted-foreground">
            <Brain className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">No insights available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}