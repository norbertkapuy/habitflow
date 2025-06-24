import { 
  Habit, 
  HabitEntry, 
  AIHabitSuggestion, 
  AIInsight, 
  AISettings, 
  AIAnalysisRequest,
  GroqModel
} from './types'

class AIService {
  private static instance: AIService
  private settings: AISettings | null = null
  private baseURL = 'https://api.groq.com/openai/v1'
  private availableModels: GroqModel[] = [
    // Production Models (highest priority for stability)
    {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B Versatile',
      provider: 'Meta',
      contextWindow: 131072,
      maxTokens: 32768,
      type: 'production',
      speed: 275,
      priority: 1
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      provider: 'Meta',
      contextWindow: 131072,
      maxTokens: 131072,
      type: 'production',
      speed: 750,
      priority: 2
    },
    {
      id: 'gemma2-9b-it',
      name: 'Gemma2 9B',
      provider: 'Google',
      contextWindow: 8192,
      maxTokens: 8192,
      type: 'production',
      speed: 500,
      priority: 3
    },
    // Preview Models (lower priority, may be discontinued)
    {
      id: 'deepseek-r1-distill-llama-70b',
      name: 'DeepSeek R1 Distill Llama 70B',
      provider: 'DeepSeek/Meta',
      contextWindow: 131072,
      maxTokens: 131072,
      type: 'preview',
      speed: 275,
      priority: 4
    },
    {
      id: 'meta-llama/llama-4-scout-17b-16e-instruct',
      name: 'Llama 4 Scout 17B',
      provider: 'Meta',
      contextWindow: 131072,
      maxTokens: 8192,
      type: 'preview',
      speed: 460,
      priority: 5
    },
    {
      id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      name: 'Llama 4 Maverick 17B',
      provider: 'Meta',
      contextWindow: 131072,
      maxTokens: 8192,
      type: 'preview',
      speed: 240,
      priority: 6
    },
    {
      id: 'mistral-saba-24b',
      name: 'Mistral Saba 24B',
      provider: 'Mistral AI',
      contextWindow: 32768,
      maxTokens: 32768,
      type: 'preview',
      speed: 330,
      priority: 7
    },
    {
      id: 'qwen-qwq-32b',
      name: 'Qwen QwQ 32B',
      provider: 'Alibaba Cloud',
      contextWindow: 131072,
      maxTokens: 131072,
      type: 'preview',
      speed: 400,
      priority: 8
    },
    {
      id: 'qwen/qwen3-32b',
      name: 'Qwen3 32B',
      provider: 'Alibaba Cloud',
      contextWindow: 131072,
      maxTokens: 40960,
      type: 'preview',
      speed: 491,
      priority: 9
    }
  ]
  private modelFailureCount: Map<string, number> = new Map()
  private lastUsedModel: string | null = null

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

  getAvailableModels(): GroqModel[] {
    return this.availableModels.sort((a, b) => a.priority - b.priority)
  }

  private getNextAvailableModel(excludeModels: string[] = []): GroqModel | null {
    const sortedModels = this.getAvailableModels()
    
    for (const model of sortedModels) {
      if (excludeModels.includes(model.id)) continue
      
      const failureCount = this.modelFailureCount.get(model.id) || 0
      // Skip models that have failed more than 3 times in the last session
      if (failureCount >= 3) continue
      
      return model
    }
    
    // If all models have failed, reset failure counts and try again
    if (excludeModels.length === 0) {
      console.log('🤖 All models exhausted, resetting failure counts...')
      this.modelFailureCount.clear()
      return this.getNextAvailableModel()
    }
    
    return null
  }

  private recordModelFailure(modelId: string): void {
    const currentCount = this.modelFailureCount.get(modelId) || 0
    this.modelFailureCount.set(modelId, currentCount + 1)
    console.log(`🤖 Model ${modelId} failure count: ${currentCount + 1}`)
  }

  private recordModelSuccess(modelId: string): void {
    // Reset failure count on successful use
    this.modelFailureCount.set(modelId, 0)
    this.lastUsedModel = modelId
  }

  private async makeAPICall(messages: any[], temperature = 0.7, excludeModels: string[] = []): Promise<{ response: string, modelUsed: string }> {
    const settings = this.getSettings()
    
    if (!settings.enabled || !settings.apiKey) {
      throw new Error('AI service not configured')
    }

    const model = this.getNextAvailableModel(excludeModels)
    if (!model) {
      throw new Error('No available models to try')
    }

    try {
      console.log(`🤖 Attempting API call with model: ${model.name} (${model.id})`)
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: model.id,
          messages,
          temperature,
          max_tokens: Math.min(1000, model.maxTokens)
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `API request failed: ${response.status} - ${errorText}`
        
        try {
          const errorData = JSON.parse(errorText)
          if (response.status === 401) {
            errorMessage = 'Invalid API key. Please check your Groq API key in settings.'
            throw new Error(errorMessage) // Don't retry for auth errors
          } else if (response.status === 429) {
            errorMessage = `Rate limit exceeded for ${model.name}. Trying next model...`
            console.log(`🤖 ${errorMessage}`)
            this.recordModelFailure(model.id)
            
            // Try next model
            return await this.makeAPICall(messages, temperature, [...excludeModels, model.id])
          } else if (response.status === 400) {
            errorMessage = 'Invalid request. Please check your model selection and try again.'
          } else if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (parseError) {
          // If it's a 429, try the next model even if JSON parsing fails
          if (response.status === 429) {
            console.log(`🤖 Rate limit hit for ${model.name}, trying next model...`)
            this.recordModelFailure(model.id)
            return await this.makeAPICall(messages, temperature, [...excludeModels, model.id])
          }
        }
        
        this.recordModelFailure(model.id)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const responseText = data.choices[0]?.message?.content || ''
      
      this.recordModelSuccess(model.id)
      console.log(`🤖 Successful API call with ${model.name}`)
      
      return {
        response: responseText,
        modelUsed: model.id
      }
    } catch (error) {
      console.error(`🤖 API call failed with ${model.name}:`, error)
      this.recordModelFailure(model.id)
      
      // If this was a rate limit or server error, try the next model
      if (error instanceof Error && (
        error.message.includes('rate limit') || 
        error.message.includes('429') ||
        error.message.includes('500') ||
        error.message.includes('502') ||
        error.message.includes('503')
      )) {
        console.log(`🤖 Retrying with next available model...`)
        return await this.makeAPICall(messages, temperature, [...excludeModels, model.id])
      }
      
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

      const { response, modelUsed } = await this.makeAPICall(messages, 0.8)
      console.log(`🤖 Raw API response from ${modelUsed}:`, response)
      
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

      const { response, modelUsed } = await this.makeAPICall(messages, 0.6)
      console.log(`🤖 Raw insights response from ${modelUsed}:`, response)
      
      // Clean the response - remove any text before/after JSON
      let cleanResponse = response.trim()
      const jsonStart = cleanResponse.indexOf('[')
      const jsonEnd = cleanResponse.lastIndexOf(']')
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      try {
        const insights = JSON.parse(cleanResponse)
        return insights.map((insight: any, index: number) => ({
          id: `ai-insight-${Date.now()}-${index}`,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence || 0.7,
          createdAt: new Date()
        }))
      } catch (parseError) {
        console.error('🤖 Failed to parse insights JSON:', parseError)
        return []
      }
    } catch (error) {
      console.error('🤖 Failed to generate insights:', error)
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
          content: 'You are a motivational coach. Generate a brief, encouraging message for a habit tracker user. Keep it positive and specific to their progress. Respond with only the motivational message, no quotes or additional formatting.'
        },
        {
          role: 'user',
          content: `Generate motivation for habit "${habitName}" with ${streakCount} day streak and ${completionRate}% completion rate.`
        }
      ]

      const { response } = await this.makeAPICall(messages, 0.8)
      return response.trim() || this.getFallbackMotivation(streakCount, completionRate)
    } catch (error) {
      console.error('🤖 Failed to generate motivational message:', error)
      return this.getFallbackMotivation(streakCount, completionRate)
    }
  }

  private getFallbackMotivation(streakCount: number, completionRate: number): string {
    if (streakCount > 7) return "You're on fire! Keep that momentum going! 🔥"
    if (completionRate > 80) return "Excellent consistency! You're building lasting habits! ⭐"
    return "Every small step counts. You've got this! 💪"
  }

  private calculateCompletionRate(habits: Habit[], entries: HabitEntry[]): number {
    if (habits.length === 0) return 0
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    })

    const totalPossible = habits.length * 7
    const completed = entries.filter(entry => 
      last7Days.includes(entry.date) && entry.completed
    ).length

    return Math.round((completed / totalPossible) * 100)
  }

  private prepareAnalysisData(request: AIAnalysisRequest) {
    const { habits, entries, timeframe } = request
    
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    const relevantEntries = entries.filter(entry => 
      new Date(entry.date) >= startDate
    )
    
    return {
      totalHabits: habits.length,
      categories: this.getCategoryCounts(habits),
      completionRate: this.calculateCompletionRate(habits, relevantEntries),
      streaks: this.getStreakData(habits, relevantEntries),
      timeframe,
      entryCount: relevantEntries.length
    }
  }

  private getCategoryCounts(habits: Habit[]): Record<string, number> {
    return habits.reduce((counts, habit) => {
      counts[habit.category] = (counts[habit.category] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  }

  private getStreakData(habits: Habit[], entries: HabitEntry[]) {
    return habits.map(habit => {
      const habitEntries = entries
        .filter(entry => entry.habitId === habit.id && entry.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      let currentStreak = 0
      const today = new Date().toISOString().split('T')[0]
      let checkDate = today
      
      for (let i = 0; i < 30; i++) {
        const hasEntry = habitEntries.some(entry => entry.date === checkDate)
        if (hasEntry) {
          currentStreak++
        } else {
          break
        }
        
        const date = new Date(checkDate)
        date.setDate(date.getDate() - 1)
        checkDate = date.toISOString().split('T')[0]
      }
      
      return {
        habitId: habit.id,
        habitName: habit.name,
        currentStreak,
        totalEntries: habitEntries.length
      }
    })
  }

  async testConnection(): Promise<boolean> {
    const settings = this.getSettings()
    if (!settings.apiKey) {
      return false
    }

    try {
      const { response } = await this.makeAPICall([
        { role: 'user', content: 'Say "Connection successful" if you can read this.' }
      ], 0.1)
      return response.toLowerCase().includes('connection successful')
    } catch (error) {
      console.error('🤖 Connection test failed:', error)
      return false
    }
  }

  getCurrentModel(): string | null {
    return this.lastUsedModel
  }

  getModelStats(): { model: string, failures: number }[] {
    return this.getAvailableModels().map(model => ({
      model: `${model.name} (${model.id})`,
      failures: this.modelFailureCount.get(model.id) || 0
    }))
  }
}

export default AIService.getInstance()