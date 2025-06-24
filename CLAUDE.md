# HabitFlow - Project Overview

## Project Description
HabitFlow is a comprehensive habit tracking application built with Next.js 15, TypeScript, and shadcn/ui components. Features modern dark/light themes, animations, analytics, complete notification system, and cutting-edge AI-powered insights using Groq API integration.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **UI Components**: shadcn/ui (manually configured)
- **Animations**: Framer Motion
- **Charts**: Recharts for analytics visualization
- **Data Storage**: Local storage (browser-based)
- **Date Handling**: date-fns library
- **AI Integration**: Groq API (OpenAI-compatible format)
- **AI Models**: Llama 3.3 70B, Llama 3 8B, Mixtral 8x7B, Gemma2 9B

## Key Features Implemented
### Core Functionality
- ✅ **Habit Management**: Create, edit, delete habits with categories and colors
- ✅ **Daily Tracking**: Check off habits daily with streak tracking
- ✅ **Analytics Dashboard**: Comprehensive charts and statistics
- ✅ **History Calendar**: Month-by-month habit completion visualization
- ✅ **Settings System**: Full customization with real-time application

### Advanced Features
- ✅ **Edit Habit Modal**: Full editing capabilities with form validation
- ✅ **View History Integration**: Click habit menu → View history (filters to that habit)
- ✅ **Notification System**: Browser notifications + custom UI fallback
- ✅ **Theme System**: Light/Dark/System with 4 color schemes
- ✅ **Animation Controls**: Toggle animations on/off globally
- ✅ **Compact Mode**: Reduce spacing throughout app

### 🤖 AI-Powered Features (NEW)
- ✅ **Smart Habit Suggestions**: AI-generated personalized habit recommendations
- ✅ **Intelligent Insights**: Pattern recognition and habit correlation analysis
- ✅ **Performance Predictions**: AI forecasting of habit success likelihood
- ✅ **Motivational AI**: Context-aware motivational messages
- ✅ **Advanced Analytics**: AI-driven habit pattern detection
- ✅ **Correlation Discovery**: Automated habit relationship identification
- ✅ **Trend Analysis**: Multi-timeframe AI insights (week/month/quarter)

## Architecture

### File Structure
```
/app
  globals.css (Tailwind v4 + custom CSS variables)
  layout.tsx
  page.tsx

/components
  ui/ (shadcn components)
  habit-card.tsx (individual habit with weekly view)
  habit-list.tsx (main container, view switching)
  habit-header.tsx (navigation, centered buttons)
  add-habit-form.tsx (create new habits)
  edit-habit-form.tsx (edit existing habits)
  habit-stats.tsx (4 stat cards with animations)
  analytics-view.tsx (charts and detailed analytics)
  history-view.tsx (calendar view with filtering)
  settings-view.tsx (comprehensive settings panel)
  ai-suggestions.tsx (AI habit recommendations)
  ai-insights.tsx (AI analytics and correlations)

/lib
  types.ts (TypeScript interfaces + AI types)
  storage.ts (localStorage utilities)
  date-utils.ts (date helper functions)
  utils.ts (general utilities)
  notifications.ts (notification service)
  ai-service.ts (DeepSeek API integration)
```

### Data Models
```typescript
interface Habit {
  id: string
  name: string
  description?: string
  category: string
  color: string
  createdAt: Date
  isActive: boolean
}

interface HabitEntry {
  id: string
  habitId: string
  date: string // YYYY-MM-DD format
  completed: boolean
  completedAt?: Date
}

interface SettingsData {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  notificationTime: string
  soundEnabled: boolean
  weekStartsOn: 'sunday' | 'monday'
  defaultView: 'habits' | 'analytics' | 'history' | 'settings'
  animationsEnabled: boolean
  autoBackup: boolean
  streakGoal: number
  dailyGoal: number
  reminderFrequency: 'none' | 'daily' | 'weekly'
  colorScheme: 'default' | 'colorful' | 'minimal' | 'high-contrast'
  compactMode: boolean
  showMotivationalQuotes: boolean
  privateMode: boolean
}

// AI-Related Data Models
interface AIHabitSuggestion {
  id: string
  name: string
  description: string
  category: string
  color: string
  reasoning: string
  confidence: number
  tags: string[]
}

interface AIInsight {
  id: string
  type: 'pattern' | 'suggestion' | 'correlation' | 'prediction'
  title: string
  description: string
  data?: any
  confidence: number
  createdAt: Date
}

interface AISettings {
  enabled: boolean
  apiKey: string
  model: 'llama-3.3-70b-versatile' | 'llama3-8b-8192' | 'mixtral-8x7b-32768' | 'gemma2-9b-it'
  autoSuggestions: boolean
  weeklyInsights: boolean
  correlationAnalysis: boolean
  predictionEnabled: boolean
  maxSuggestions: number
}
```

## Key Implementation Details

### Theme System
- **CSS Variables**: Uses Tailwind v4 CSS-first approach with `@theme` directive
- **Dynamic Classes**: `applyTheme()`, `applyColorScheme()` functions add classes to `<html>`
- **Color Schemes**: 
  - Default: Blue-based modern theme
  - Colorful: Purple/pink vibrant theme
  - Minimal: Grayscale with accessibility focus
  - High Contrast: WCAG compliant high contrast

### Navigation System
- **Centered Layout**: 2-row design with nav buttons centered, search below
- **View Modes**: habits | analytics | history | settings
- **State Management**: `currentView` state controls which component renders
- **Search Integration**: Only shows in habits view, centered with add button

### Settings Implementation
- **Real-time Application**: All settings apply immediately via DOM class manipulation
- **localStorage Persistence**: Settings auto-save and restore on app load
- **CSS Classes for Control**:
  - `.no-animations` - Disables all animations
  - `.compact-mode` - Reduces spacing by 25%
  - `.color-{scheme}` - Applies color scheme variations

### Notification System
- **Service Pattern**: Singleton `NotificationService` class
- **Dual Fallback**: Browser notifications → Custom UI notifications
- **Smart Scheduling**: Checks every minute for due reminders
- **SSR Safe**: Handles server-side rendering gracefully
- **Permission Management**: Requests permissions, handles denials gracefully

### Animation System
- **Framer Motion**: Comprehensive animations throughout
- **Stagger Animations**: Cards animate in sequence
- **Micro-interactions**: Hover effects, button presses, form submissions
- **Performance**: Can be globally disabled via settings
- **Spring Physics**: Natural feeling animations with bounce

### Data Storage Strategy
- **localStorage Based**: All data stored locally in browser
- **No Backend Required**: Completely client-side application
- **JSON Serialization**: Simple key-value storage with JSON
- **Export/Import**: Full data backup and restore functionality

### 🤖 AI Integration System (NEW)
- **Service Pattern**: Singleton `AIService` class for consistent state management
- **OpenAI Compatibility**: Uses OpenAI SDK format with Groq endpoint
- **Model Selection**: Supports Llama 3.3 70B, Llama 3 8B, Mixtral 8x7B, and Gemma2 9B
- **Error Handling**: Graceful fallbacks when API unavailable or rate limited
- **Privacy First**: API keys stored locally, no data sent unless AI explicitly enabled
- **Free Tier**: Groq provides generous free AI inference with ultra-fast speeds
- **Connection Testing**: Built-in API key validation and connection testing
- **Lightning Fast**: Groq's LPU technology delivers 300+ tokens/second inference

## Common Development Patterns

### Component Structure
```typescript
// Typical component pattern
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ComponentName({ prop }: Props) {
  const [state, setState] = useState(defaultValue)
  
  useEffect(() => {
    // Load data, set up listeners
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Content */}
    </motion.div>
  )
}
```

### Storage Functions
```typescript
// Reading data
const habits = getHabits()
const entries = getHabitEntries()
const settings = JSON.parse(localStorage.getItem('habit-tracker-settings') || '{}')

// Writing data
saveHabits(updatedHabits)
saveHabitEntries(updatedEntries)
localStorage.setItem('habit-tracker-settings', JSON.stringify(settings))

// AI Service usage
import AIService from '@/lib/ai-service'
const aiSettings = AIService.getSettings()
AIService.updateSettings({ enabled: true, apiKey: 'gsk_your_groq_key' })
const suggestions = await AIService.generateHabitSuggestions(habits, entries)
const insights = await AIService.generateInsights({ habits, entries, timeframe: 'month', analysisType: 'insights' })
```

### Animation Patterns
```typescript
// Container for staggered children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

// Individual item
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// AI Component Integration Pattern
'use client'
import { useState, useEffect } from 'react'
import AIService from '@/lib/ai-service'

export function AIComponent() {
  const [aiEnabled, setAiEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  useEffect(() => {
    const settings = AIService.getSettings()
    setAiEnabled(settings.enabled && settings.apiKey.length > 0)
  }, [])

  const handleAIAction = async () => {
    if (!aiEnabled) return
    
    setLoading(true)
    try {
      const data = await AIService.generateInsights(requestData)
      setResults(data)
    } catch (error) {
      console.error('AI action failed:', error)
      // Graceful fallback behavior
    } finally {
      setLoading(false)
    }
  }

  if (!aiEnabled) {
    return <div>Enable AI features in settings to use this functionality</div>
  }

  return (
    <div>
      {loading ? <LoadingSpinner /> : <ResultsDisplay results={results} />}
    </div>
  )
}
```

## Troubleshooting & Known Issues

### Build Commands
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npx tsc --noEmit # TypeScript check
```

### CSS Issues
- **Tailwind v4**: Uses CSS-first approach, not traditional config file
- **CSS Variables**: Defined in `@theme` block in globals.css
- **Class Application**: Settings apply via `document.documentElement.classList`

### SSR Considerations
- **localStorage**: Always check `typeof window !== 'undefined'`
- **Notification Service**: Handles SSR gracefully with window checks
- **Client Components**: All interactive components use `'use client'`

### Performance Notes
- **Animation Toggle**: Uses `no-animations` class instead of removing animations
- **Notification Scheduling**: Checks every 60 seconds (configurable)
- **Chart Rendering**: Recharts handles responsive rendering automatically

### 🤖 AI Integration Issues & Solutions

#### Common API Issues
- **"Invalid API Key" Error**:
  - Verify API key format: `gsk_` followed by alphanumeric characters
  - Get your free API key at console.groq.com/keys
  - Test connection using built-in connection test button

- **Rate Limiting (429 Error)**:
  - Free tier: 1000 requests per minute (very generous!)
  - Groq provides excellent free limits for development and personal use
  - Rate limits reset quickly (typically within minutes)

- **Network/Timeout Errors**:
  - Check internet connection
  - Groq API endpoint: `https://api.groq.com/openai/v1`
  - Firewall may be blocking requests

- **Model Availability**:
  - Check model name matches: `llama-3.3-70b-versatile`, `llama3-8b-8192`, etc.
  - Some models may be temporarily unavailable
  - Switch to different model if one is having issues

#### AI Component Troubleshooting
- **AI Suggestions Not Appearing**:
  - Verify AI enabled in Settings → AI Features
  - Check API key is configured and tested
  - Ensure sufficient habit data exists (needs some habits/entries)
  - Check browser console for error messages

- **Poor AI Suggestions Quality**:
  - Try different models: Llama 3.3 70B for best quality, Llama 3 8B for speed
  - Ensure sufficient historical data (at least 1 week of habits)
  - Mixtral 8x7B often provides creative suggestions
  - Gemma2 9B is lightweight but still effective

- **Ultra-Fast AI Performance**:
  - Groq's LPU technology delivers 300+ tokens/second
  - Llama 3 8B is fastest for quick suggestions
  - Llama 3.3 70B provides best quality with excellent speed
  - Results typically appear in under 2 seconds

## Development Workflow

### Adding New Features
1. **Types First**: Define interfaces in `/lib/types.ts`
2. **Storage Functions**: Add utilities in `/lib/storage.ts` 
3. **Component Creation**: Build UI component with animations
4. **Integration**: Connect to main app via habit-list.tsx
5. **Settings**: Add controls in settings-view.tsx if needed

### Testing Checklist
#### Core Features
- [ ] Light/Dark theme switching
- [ ] All 4 color schemes work
- [ ] Animation toggle functional
- [ ] Compact mode toggle functional
- [ ] Notifications request permission
- [ ] Test notifications work
- [ ] Habit CRUD operations
- [ ] Analytics charts render
- [ ] History calendar navigation
- [ ] Data export/import
- [ ] Mobile responsive design

#### 🤖 AI Features Testing
- [ ] AI settings panel accessible in Settings → AI Features
- [ ] API key input and secure storage
- [ ] Connection testing functionality works
- [ ] Model selection (Chat vs Reasoner) saves properly
- [ ] AI suggestions appear when enabled with valid API key
- [ ] AI insights generate across different timeframes
- [ ] Pattern recognition displays meaningful data
- [ ] Correlation analysis works with multiple habits
- [ ] Prediction insights show future trends
- [ ] Error handling for API failures/insufficient credits
- [ ] Graceful fallbacks when AI disabled
- [ ] AI suggestions can be added as habits successfully

## Future Enhancement Ideas
### Core Features
- [ ] Cloud sync/backup
- [ ] Habit templates
- [ ] Goal setting with deadlines
- [ ] Social features/sharing
- [ ] Habit grouping/categories
- [ ] Offline PWA support
- [ ] Mobile app (React Native)

### 🤖 AI Enhancement Roadmap
- [ ] **Voice Interactions**: Voice commands for habit check-ins using AI
- [ ] **Smart Scheduling**: AI-optimized habit timing recommendations
- [ ] **Mood Correlation**: AI analysis of mood patterns with habit completion
- [ ] **Habit Difficulty Scoring**: AI assessment of habit complexity
- [ ] **Personal Coach**: AI-generated weekly coaching reports
- [ ] **Habit Dependency Mapping**: AI discovery of habit prerequisite chains
- [ ] **Contextual Reminders**: AI-powered location/time-based smart notifications
- [ ] **Multi-Model Integration**: Support for additional AI providers (OpenAI, Anthropic)
- [ ] **Behavioral Psychology Integration**: AI application of proven habit formation science
- [ ] **Progress Photography**: AI analysis of progress photos for visual habits
- [ ] **Social Habit Matching**: AI-powered habit buddy recommendations
- [ ] **Wearable Integration**: AI correlation with health data from smartwatches

## Important Notes for Future Development

### Core Architecture
- **shadcn/ui Setup**: Manually configured for Tailwind v4 compatibility
- **Color Variables**: Use CSS custom properties pattern for themes
- **Animation Performance**: Always provide toggle option for accessibility
- **Notification Permissions**: Handle gracefully, provide fallbacks
- **Data Migration**: Consider versioning for localStorage schema changes
- **Mobile First**: All components designed responsive-first
- **Accessibility**: High contrast mode available, focus management implemented
- **TypeScript Strict**: All code follows strict TypeScript patterns

### 🤖 AI Integration Guidelines
- **API Security**: Never commit API keys, always use environment variables or user input
- **Cost Management**: Implement usage tracking and limits to prevent unexpected charges
- **Graceful Degradation**: All AI features must work without API when disabled
- **Error Boundaries**: Comprehensive error handling for API failures and network issues
- **User Privacy**: AI features clearly opt-in, data processing transparency
- **Model Flexibility**: Architecture supports multiple AI providers and models
- **Caching Strategy**: Implement intelligent caching to minimize API costs
- **Rate Limiting**: Respect API rate limits and implement backoff strategies
- **Testing Strategy**: Mock AI responses for development and testing environments

### Groq Integration Specifics
- **API Endpoint**: `https://api.groq.com/openai/v1` (OpenAI-compatible)
- **Models Available**: `llama-3.3-70b-versatile`, `llama3-8b-8192`, `mixtral-8x7b-32768`, `gemma2-9b-it`
- **Free Tier**: Extremely generous - 1000 requests/minute, 12K tokens/minute
- **Speed**: Industry-leading 300+ tokens/second inference speed
- **Rate Limits**: Free tier provides excellent limits for personal/development use
- **Response Format**: Standard OpenAI format, easy migration to other providers
- **Authentication**: Bearer token format: `Bearer gsk_...`
- **LPU Technology**: Groq's Language Processing Units provide unmatched speed
- **Zero Cost**: Completely free for most personal habit tracking use cases