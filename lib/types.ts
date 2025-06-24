export interface Habit {
  id: string
  name: string
  description?: string
  category: string
  color: string
  createdAt: Date
  isActive: boolean
}

export interface HabitEntry {
  id: string
  habitId: string
  date: string // YYYY-MM-DD format
  completed: boolean
  notes?: string
}

export interface HabitStreak {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate?: string
}

export interface AIHabitSuggestion {
  id: string
  name: string
  description: string
  category: string
  color: string
  reasoning: string
  confidence: number
  tags: string[]
}

export interface AIInsight {
  id: string
  type: 'pattern' | 'suggestion' | 'correlation' | 'prediction'
  title: string
  description: string
  data?: any
  confidence: number
  createdAt: Date
}

export interface AISettings {
  enabled: boolean
  apiKey: string
  model: 'llama-3.3-70b-versatile' | 'llama3-8b-8192' | 'mixtral-8x7b-32768' | 'gemma2-9b-it'
  autoSuggestions: boolean
  weeklyInsights: boolean
  correlationAnalysis: boolean
  predictionEnabled: boolean
  maxSuggestions: number
}

export interface AIAnalysisRequest {
  habits: Habit[]
  entries: HabitEntry[]
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  analysisType: 'suggestions' | 'insights' | 'correlations' | 'predictions'
}