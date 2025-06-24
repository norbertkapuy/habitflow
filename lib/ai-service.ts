import { 
  Habit, 
  HabitEntry, 
  AIHabitSuggestion, 
  AIInsight, 
  AISettings, 
  AIAnalysisRequest 
} from './types'

class AIService {
  private static instance: AIService
  private settings: AISettings | null = null
  private baseURL = 'https://api.groq.com/openai/v1'

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings()
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('habit-tracker-ai-settings')
      if (stored) {
        this.settings = JSON.parse(stored)
      } else {
        this.settings = this.getDefaultSettings()
        this.saveSettings()
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error)
      this.settings = this.getDefaultSettings()
    }
  }

  private getDefaultSettings(): AISettings {
    return {
      enabled: false,
      apiKey: '',
      model: 'llama-3.3-70b-versatile',
      autoSuggestions: true,
      weeklyInsights: true,
      correlationAnalysis: true,
      predictionEnabled: false,
      maxSuggestions: 5
    }
  }

  private saveSettings(): void {
    if (typeof window !== 'undefined' && this.settings) {
      localStorage.setItem('habit-tracker-ai-settings', JSON.stringify(this.settings))
    }
  }

  getSettings(): AISettings {
    return this.settings || this.getDefaultSettings()
  }

  updateSettings(newSettings: Partial<AISettings>): void {
    this.settings = { ...this.getSettings(), ...newSettings }
    this.saveSettings()
  }

  private async makeAPICall(messages: any[], temperature = 0.7): Promise<string> {
    const settings = this.getSettings()
    
    if (!settings.enabled || !settings.apiKey) {
      throw new Error('AI service not configured')
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          temperature,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `API request failed: ${response.status} - ${errorText}`
        
        try {
          const errorData = JSON.parse(errorText)
          if (response.status === 401) {
            errorMessage = 'Invalid API key. Please check your Groq API key in settings.'
          } else if (response.status === 429) {
            errorMessage = 'Rate limit exceeded. Groq provides generous free limits - please wait a moment and try again.'
          } else if (response.status === 400) {
            errorMessage = 'Invalid request. Please check your model selection and try again.'
          } else if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (e) {
          // Keep original error message if JSON parsing fails
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('DeepSeek API call failed:', error)
      throw error
    }
  }

  async generateHabitSuggestions(
    existingHabits: Habit[], 
    recentEntries: HabitEntry[]
  ): Promise<AIHabitSuggestion[]> {
    const settings = this.getSettings()
    console.log('🤖 generateHabitSuggestions called with settings:', settings)
    
    if (!settings.enabled || !settings.autoSuggestions) {
      console.log('🤖 AI suggestions disabled:', { enabled: settings.enabled, autoSuggestions: settings.autoSuggestions })
      return []
    }

    if (!settings.apiKey) {
      console.log('🤖 No API key configured')
      return []
    }

    try {
      const habitsList = existingHabits.map(h => `${h.name} (${h.category})`).join(', ')
      const completionRate = this.calculateCompletionRate(existingHabits, recentEntries)
      
      console.log('🤖 Generating suggestions for:', { habitsList, completionRate, maxSuggestions: settings.maxSuggestions })
      
      const messages = [
        {
          role: 'system',
          content: `You are a habit formation expert. CRITICAL: You MUST respond with ONLY valid JSON - no explanations, no markdown, no additional text. Return exactly this format: [{"name":"Exercise","description":"Daily workout","category":"Health","color":"#3B82F6","reasoning":"Improves health","confidence":0.8,"tags":["fitness"]}]. Use NO newlines, NO spaces around colons, NO trailing commas. String values only - no special characters that break JSON.`
        },
        {
          role: 'user',
          content: `Current habits: ${habitsList || 'None'}. Recent completion rate: ${completionRate}%. Generate ${settings.maxSuggestions} complementary habit suggestions. Respond with ONLY the JSON array, no additional text.`
        }
      ]

      const response = await this.makeAPICall(messages, 0.8)
      console.log('🤖 Raw API response:', response)
      
      // Clean the response - remove any text before/after JSON
      let cleanResponse = response.trim()
      const jsonStart = cleanResponse.indexOf('[')
      const jsonEnd = cleanResponse.lastIndexOf(']')
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      console.log('🤖 Cleaned response:', cleanResponse)
      
      let suggestions
      try {
        suggestions = JSON.parse(cleanResponse)
      } catch (parseError) {
        console.error('🤖 JSON parse failed, attempting to fix...', parseError)
        
        // Try to fix common JSON issues aggressively
        let fixedResponse = cleanResponse
          .replace(/,\s*}/g, '}')  // Remove trailing commas before }
          .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
          .replace(/'/g, '"')      // Replace single quotes with double quotes
          .replace(/(\w+):/g, '"$1":') // Ensure property names are quoted
          .replace(/\n|\r/g, ' ')  // Remove newlines
          .replace(/\s+/g, ' ')    // Collapse multiple spaces
          .replace(/,\s*,/g, ',')  // Remove duplicate commas
          .replace(/"\s*:\s*"/g, '":"') // Fix spacing around colons
          .replace(/}\s*{/g, '},{') // Fix missing commas between objects
        
        console.log('🤖 Attempting to parse fixed JSON:', fixedResponse)
        
        try {
          suggestions = JSON.parse(fixedResponse)
        } catch (secondError) {
          console.error('🤖 JSON fix failed, returning fallback suggestions')
          // Return fallback suggestions
          suggestions = [
            {
              name: 'Try Again Later',
              description: 'AI suggestions temporarily unavailable due to formatting issue',
              category: 'System',
              color: '#6B7280',
              reasoning: 'Please refresh and try again',
              confidence: 0.1,
              tags: ['system']
            }
          ]
        }
      }
      console.log('🤖 Parsed suggestions:', suggestions)
      
      return suggestions.map((s: any, index: number) => ({
        id: `ai-suggestion-${Date.now()}-${index}`,
        name: s.name,
        description: s.description,
        category: s.category,
        color: s.color || '#3B82F6',
        reasoning: s.reasoning,
        confidence: s.confidence || 0.7,
        tags: s.tags || []
      }))
    } catch (error) {
      console.error('🤖 Failed to generate habit suggestions:', error)
      return []
    }
  }

  async generateInsights(request: AIAnalysisRequest): Promise<AIInsight[]> {
    const settings = this.getSettings()
    if (!settings.enabled) {
      return []
    }

    try {
      const analysisData = this.prepareAnalysisData(request)
      
      const messages = [
        {
          role: 'system',
          content: `You are a data analyst specializing in habit tracking. CRITICAL: You MUST respond with ONLY valid JSON - no explanations, no markdown, no additional text. Return exactly this format: [{"type":"pattern","title":"Insight Title","description":"Brief insight","confidence":0.8}]. Valid types: "pattern","suggestion","correlation","prediction". Use NO newlines, NO spaces around colons, NO trailing commas. String values only - no special characters that break JSON.`
        },
        {
          role: 'user',
          content: `Analyze this habit data: ${JSON.stringify(analysisData)}. Generate insights for ${request.analysisType} over ${request.timeframe}. Respond with ONLY the JSON array, no additional text.`
        }
      ]

      const response = await this.makeAPICall(messages, 0.6)
      console.log('🤖 Raw insights response:', response)
      
      // Clean the response - remove any text before/after JSON
      let cleanResponse = response.trim()
      const jsonStart = cleanResponse.indexOf('[')
      const jsonEnd = cleanResponse.lastIndexOf(']')
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      console.log('🤖 Cleaned insights response:', cleanResponse)
      
      let insights
      try {
        insights = JSON.parse(cleanResponse)
      } catch (parseError) {
        console.error('🤖 JSON parse failed, attempting to fix...', parseError)
        
        // Try to fix common JSON issues aggressively
        let fixedResponse = cleanResponse
          .replace(/,\s*}/g, '}')  // Remove trailing commas before }
          .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
          .replace(/'/g, '"')      // Replace single quotes with double quotes
          .replace(/(\w+):/g, '"$1":') // Ensure property names are quoted
          .replace(/\n|\r/g, ' ')  // Remove newlines
          .replace(/\s+/g, ' ')    // Collapse multiple spaces
          .replace(/,\s*,/g, ',')  // Remove duplicate commas
          .replace(/"\s*:\s*"/g, '":"') // Fix spacing around colons
          .replace(/}\s*{/g, '},{') // Fix missing commas between objects
        
        console.log('🤖 Attempting to parse fixed JSON:', fixedResponse)
        
        try {
          insights = JSON.parse(fixedResponse)
        } catch (secondError) {
          console.error('🤖 JSON fix failed, returning fallback insights')
          // Return fallback insights
          insights = [
            {
              type: 'pattern',
              title: 'Data Analysis Unavailable',
              description: 'Unable to generate AI insights at this time. The AI response contained invalid format. Please try again.',
              confidence: 0.1
            }
          ]
        }
      }
      
      return insights.map((insight: any, index: number) => ({
        id: `ai-insight-${Date.now()}-${index}`,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence || 0.7,
        createdAt: new Date()
      }))
    } catch (error) {
      console.error('Failed to generate insights:', error)
      return []
    }
  }

  async generateMotivationalMessage(
    habitName: string, 
    streakCount: number, 
    completionRate: number
  ): Promise<string> {
    const settings = this.getSettings()
    if (!settings.enabled) {
      return this.getFallbackMotivation(streakCount, completionRate)
    }

    try {
      const messages = [
        {
          role: 'system',
          content: 'Generate a short, encouraging message for a habit tracker user. Be positive and motivating. Keep it under 50 words.'
        },
        {
          role: 'user',
          content: `Habit: ${habitName}, Current streak: ${streakCount} days, Completion rate: ${completionRate}%. Generate an encouraging message.`
        }
      ]

      const response = await this.makeAPICall(messages, 0.9)
      return response.trim() || this.getFallbackMotivation(streakCount, completionRate)
    } catch (error) {
      return this.getFallbackMotivation(streakCount, completionRate)
    }
  }

  private getFallbackMotivation(streakCount: number, completionRate: number): string {
    if (streakCount === 0) return "Every journey begins with a single step. You've got this!"
    if (streakCount < 7) return `${streakCount} days strong! Keep building momentum.`
    if (streakCount < 30) return `${streakCount} days streak! You're forming a solid habit.`
    return `Amazing ${streakCount} day streak! You're an inspiration.`
  }

  private calculateCompletionRate(habits: Habit[], entries: HabitEntry[]): number {
    if (habits.length === 0) return 0
    
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    
    const recentEntries = entries.filter(entry => 
      new Date(entry.date) >= last30Days
    )
    
    const completedEntries = recentEntries.filter(entry => entry.completed)
    return Math.round((completedEntries.length / recentEntries.length) * 100) || 0
  }

  private prepareAnalysisData(request: AIAnalysisRequest) {
    const timeframeDays = {
      'week': 7,
      'month': 30,
      'quarter': 90,
      'year': 365
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays[request.timeframe])

    const relevantEntries = request.entries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    )

    return {
      habits: request.habits.map(h => ({
        name: h.name,
        category: h.category,
        createdAt: h.createdAt
      })),
      entriesCount: relevantEntries.length,
      completionRate: this.calculateCompletionRate(request.habits, relevantEntries),
      categoryCounts: this.getCategoryCounts(request.habits),
      streakData: this.getStreakData(request.habits, relevantEntries)
    }
  }

  private getCategoryCounts(habits: Habit[]): Record<string, number> {
    return habits.reduce((acc, habit) => {
      acc[habit.category] = (acc[habit.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private getStreakData(habits: Habit[], entries: HabitEntry[]) {
    return habits.map(habit => {
      const habitEntries = entries
        .filter(e => e.habitId === habit.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      let currentStreak = 0
      const today = new Date().toISOString().split('T')[0]
      
      for (let i = 0; i < habitEntries.length; i++) {
        if (habitEntries[i].completed) {
          currentStreak++
        } else {
          break
        }
      }

      return {
        habitName: habit.name,
        currentStreak,
        recentEntries: habitEntries.slice(0, 7).length
      }
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      const messages = [
        {
          role: 'user',
          content: 'Hello, please respond with "Connection successful"'
        }
      ]
      
      const response = await this.makeAPICall(messages, 0.1)
      return response.toLowerCase().includes('connection successful')
    } catch (error) {
      console.error('AI connection test failed:', error)
      return false
    }
  }
}

export default AIService.getInstance()