# HabitFlow - Project Overview

## Project Description
HabitFlow is a comprehensive habit tracking application built with Next.js 15, TypeScript, and shadcn/ui components. Features modern dark/light themes, animations, analytics, complete notification system, cutting-edge AI-powered insights using Groq API integration, and a production-ready Docker backend with PostgreSQL database persistence.

## Tech Stack
### Frontend
- **Framework**: Next.js 15 with App Router (static export for production)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **UI Components**: shadcn/ui (manually configured)
- **Animations**: Framer Motion
- **Charts**: Recharts for analytics visualization
- **Date Handling**: date-fns library
- **AI Integration**: Groq API (OpenAI-compatible format)
- **AI Models**: 9 Groq models with automatic switching (Llama 3.3 70B, Llama 3.1 8B, Gemma2 9B, etc.)

### Backend & Infrastructure
- **API Server**: Node.js with Express
- **Database**: PostgreSQL 15 with optimized schema
- **Web Server**: Nginx with reverse proxy and SSL support
- **Cache**: Redis for performance optimization
- **Containerization**: Docker Compose multi-service setup
- **Data Storage**: PostgreSQL database with localStorage migration capability
- **Security**: Input validation, rate limiting, CORS protection, security headers

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
- ✅ **Notification System**: Browser notifications + custom UI fallback + daily motivation
- ✅ **Theme System**: Light/Dark/System with 4 color schemes
- ✅ **Animation Controls**: Toggle animations on/off globally
- ✅ **Compact Mode**: Reduce spacing throughout app
- ✅ **Motivational Quotes Strip**: Top-of-page inspirational quotes with auto-rotation

### 🤖 AI-Powered Features (NEW)
- ✅ **Smart Habit Suggestions**: AI-generated personalized habit recommendations (compact scrollable)
- ✅ **Intelligent Insights**: Pattern recognition and habit correlation analysis (compact scrollable)
- ✅ **Performance Predictions**: AI forecasting of habit success likelihood
- ✅ **Motivational AI**: Context-aware motivational messages
- ✅ **Advanced Analytics**: AI-driven habit pattern detection
- ✅ **Correlation Discovery**: Automated habit relationship identification
- ✅ **Trend Analysis**: Multi-timeframe AI insights (week/month/quarter)
- ✅ **Modern UI Design**: Compact cards with scrollable content, positioned below habits for better hierarchy
- ✅ **Automatic Model Switching**: Intelligent fallback across all 9 Groq models when rate limits are hit
- ✅ **Zero-Downtime AI**: Production models (Llama 3.3 70B, 3.1 8B, Gemma2 9B) with preview model fallbacks

## Architecture

### File Structure
```
/app
  globals.css (Tailwind v4 + custom CSS variables)
  layout.tsx
  page.tsx

/components
  ui/ (shadcn components)
  habit-card.tsx (modern horizontal layout with 2024-2025 design trends)
  habit-list.tsx (main container, view switching, layout management)
  habit-header.tsx (navigation, centered buttons, glassmorphism design)
  add-habit-form.tsx (create new habits, controllable modal)
  edit-habit-form.tsx (edit existing habits)
  habit-stats.tsx (4 stat cards with animations)
  analytics-view.tsx (charts and detailed analytics)
  history-view.tsx (calendar view with filtering)
  settings-view.tsx (comprehensive settings panel with notification management)
  ai-suggestions.tsx (AI habit recommendations, compact scrollable design)
  ai-insights.tsx (AI analytics and correlations, compact scrollable design)
  motivational-quotes.tsx (top-strip motivational quotes with auto-rotation)

/lib
  types.ts (TypeScript interfaces + AI types)
  storage.ts (localStorage utilities)
  date-utils.ts (date helper functions)
  utils.ts (general utilities)
  notifications.ts (notification service)
  ai-service.ts (Groq API integration with multiple LLM models)
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
  autoSuggestions: boolean
  weeklyInsights: boolean
  correlationAnalysis: boolean
  predictionEnabled: boolean
  maxSuggestions: number
}

interface GroqModel {
  id: string
  name: string
  provider: string
  contextWindow: number
  maxTokens: number
  type: 'production' | 'preview'
  speed: number // tokens per second
  priority: number // lower number = higher priority for fallback
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
- **Compact Header**: Single-row layout with logo and title on the left, navigation and search on the right.
- **Responsive Design**: Navigation buttons collapse to icons on smaller screens.
- **View Modes**: habits | analytics | history | settings
- **State Management**: `currentView` state controls which component renders
- **Search Integration**: Only shows in habits view.
- **`shadcn/ui` Components**: Uses `ToggleGroup` for the main navigation.

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
- **Smart Scheduling**: Checks every minute for due reminders, auto-setup for new habits
- **Daily Motivation**: AI-powered motivational quote notifications
- **Reminder Management**: Setup reminders for all habits, time/frequency changes
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
- **Automatic Model Management**: Intelligent switching across 9 Groq models with priority-based fallback
- **Production Model Priority**: Llama 3.3 70B → Llama 3.1 8B → Gemma2 9B (stable, reliable)
- **Preview Model Fallback**: DeepSeek R1, Llama 4 Scout/Maverick, Mistral Saba, Qwen models
- **Smart Rate Limit Handling**: Automatically switches to next model on 429 errors
- **Failure Tracking**: Records model failures and skips problematic models temporarily
- **Error Handling**: Graceful fallbacks when API unavailable or all models rate limited
- **Privacy First**: API keys stored locally, no data sent unless AI explicitly enabled
- **Free Tier**: Groq provides generous free AI inference with ultra-fast speeds
- **Connection Testing**: Built-in API key validation and connection testing
- **Lightning Fast**: Groq's LPU technology delivers 300+ tokens/second inference
- **Zero-Downtime Design**: Never fails due to single model limitations
- **Compact Design**: AI components positioned below habits, scrollable containers (`max-h-32`)
- **Subtle Integration**: Muted backgrounds, consistent theming with main app

### 🎨 Modern UI Design System (2024-2025 Trends)
- **Habit Cards**: Horizontal layout with icon, title, and inline day indicators
- **Day Indicators**: Modern rounded-xl design with gradients, shadows, and micro-animations
- **Visual Hierarchy**: Vertical stack (day labels above indicators) for better UX
- **State Visualization**: 
  - Completed: Green gradient with glow and rotating check icon
  - Today: Primary color with border highlight and shadow
  - Incomplete: Muted with subtle dot indicator
- **Micro-interactions**: Spring-based animations, hover lift effects, color-adaptive shadows
- **Contemporary Aesthetics**: Following 2024-2025 trends (modern skeuomorphism, emotional design)
- **Compact Layout**: ~60% height reduction while maintaining all functionality
- **Accessibility**: High contrast states, larger hit targets, clear visual hierarchy

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

// Model management (automatic)
const currentModel = AIService.getCurrentModel()  // Get currently active model
const modelStats = AIService.getModelStats()     // Get failure counts for debugging
const availableModels = AIService.getAvailableModels() // Get all 9 models with priorities
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

// Modern Habit Card Pattern (2024-2025 Design)
export function ModernHabitCard({ habit, onUpdate }: HabitCardProps) {
  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon and Title */}
          <div className="flex items-center gap-2">
            <motion.div 
              className="flex items-center justify-center w-8 h-8 rounded-lg text-sm flex-shrink-0" 
              style={{ backgroundColor: habit.color + '20', color: habit.color }}
              whileHover={{ scale: 1.05 }}
            >
              {getCategoryIcon(habit.category)}
            </motion.div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{habit.name}</CardTitle>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="outline" className="text-xs h-4 px-1">
                  {getStreak()}d
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {completedThisWeek}/{weekDates.length} this week
                </span>
              </div>
            </div>
          </div>

          {/* Modern Day Indicators */}
          <div className="flex gap-1.5 flex-1 justify-center">
            {weekDates.map((date, index) => (
              <motion.div
                key={date}
                whileHover={{ y: -2 }}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleToggle(date)}
              >
                <span className="text-xs font-medium mb-1">{dayName.charAt(0)}</span>
                <motion.div
                  className={`relative w-7 h-7 rounded-xl transition-all duration-200 ${
                    completed
                      ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/25'
                      : isToday
                      ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary shadow-md shadow-primary/25'
                      : 'bg-muted/60 border border-border/50 hover:border-primary/30'
                  }`}
                >
                  {completed ? (
                    <CheckCircle className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 absolute inset-0 m-auto" />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            {/* Menu items... */}
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
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

## 🚀 **Quick Start for New AI Sessions**

### For Docker Backend Development
```bash
# 1. Start the complete Docker stack
./docker-manage.sh start

# 2. Check health of all services
./docker-manage.sh health

# 3. View logs if needed
./docker-manage.sh logs

# 4. Access the application
# Frontend: http://localhost
# API: http://localhost:3001/api
# Health: http://localhost:3001/api/health

# 5. For development changes
./docker-manage.sh rebuild  # Rebuild after code changes
```

### For Frontend-Only Development
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# App runs on http://localhost:3000 or 3001

# 3. For production build
npm run build
npm run export  # For static export
```

### Database Management
```bash
# Connect to database
./docker-manage.sh db-shell

# Backup database
./docker-manage.sh backup

# View container status
./docker-manage.sh status

# Clean up everything
./docker-manage.sh clean
```

### Testing API Endpoints
```bash
# Test health
curl http://localhost:3001/api/health

# Get habits
curl http://localhost:3001/api/habits

# Create habit
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"Health","color":"#FF6B6B"}'
```

### Key Files for Development
- **Frontend**: `app/page.tsx`, `components/habit-list.tsx`
- **Backend API**: `backend/src/routes/habits.js`, `backend/src/routes/entries.js`
- **Database**: `backend/sql/init.sql`, `backend/src/config/database.js`
- **Docker**: `docker-compose.yml`, `docker-manage.sh`
- **Migration**: `lib/migration-service.ts`

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

## 🐳 **Docker Backend Implementation (Latest Session - December 2024)**

### 🏗️ **Complete Backend Architecture**
- ✅ **Docker Infrastructure**: Multi-container setup with Docker Compose
- ✅ **PostgreSQL Database**: Production-ready database with proper schema, indexes, and constraints
- ✅ **Express API Server**: Full RESTful API with comprehensive CRUD operations
- ✅ **Nginx Web Server**: High-performance reverse proxy with static file serving
- ✅ **Redis Cache**: Optional caching layer for performance optimization
- ✅ **Health Monitoring**: Comprehensive health checks and status endpoints

### 📋 **Database Schema**
```sql
-- Core Tables
habits (id UUID, name, description, category, color, created_at, updated_at, is_active)
habit_entries (id UUID, habit_id UUID, date DATE, completed BOOLEAN, completed_at TIMESTAMP)
user_settings (id UUID, user_id, settings JSONB)

-- Indexes & Performance
- Proper foreign key constraints with CASCADE delete
- Optimized indexes for queries (habit_id, date, category, etc.)
- Triggers for automatic timestamp updates
- Functions for streak calculations and analytics

-- Sample Data
- 5 pre-configured sample habits across different categories
- Default user settings with AI configuration
- Database views for analytics and reporting
```

### 🚀 **API Endpoints**
```bash
# Habits API
GET    /api/habits              # Get all habits (with optional filters)
GET    /api/habits/:id          # Get specific habit
POST   /api/habits              # Create new habit
PUT    /api/habits/:id          # Update habit
DELETE /api/habits/:id          # Soft delete habit
GET    /api/habits/categories   # Get habit categories
POST   /api/habits/bulk         # Bulk create habits

# Entries API
GET    /api/entries                      # Get entries (requires filters)
GET    /api/entries/habits/:habitId      # Get entries for specific habit
GET    /api/entries/habits/:habitId/stats # Get completion statistics
GET    /api/entries/habits/:habitId/:date # Get specific entry
POST   /api/entries                      # Create/update entry
PUT    /api/entries/habits/:habitId/:date # Update specific entry
DELETE /api/entries/habits/:habitId/:date # Delete entry
POST   /api/entries/bulk                 # Bulk create entries
GET    /api/entries/export               # Export data

# Health & Monitoring
GET    /api/health              # System health check
GET    /api/health/detailed     # Detailed system information
```

### 🔧 **Docker Services Configuration**
```yaml
services:
  postgres:     # PostgreSQL 15 database with initialization scripts
  backend:      # Node.js API server with health checks
  nginx:        # High-performance web server with SSL support
  redis:        # Optional caching layer
  frontend-build: # Next.js static build container
```

### 📁 **Backend File Structure**
```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # PostgreSQL connection & initialization
│   ├── models/
│   │   ├── Habit.js           # Habit model with full CRUD operations
│   │   └── HabitEntry.js      # Entry model with analytics functions
│   ├── routes/
│   │   ├── habits.js          # Habits API routes with validation
│   │   ├── entries.js         # Entries API routes with validation
│   │   └── health.js          # Health monitoring endpoints
│   └── index.js               # Main Express server
├── sql/
│   └── init.sql               # Database initialization script
├── Dockerfile                 # Backend container configuration
└── package.json               # Dependencies and scripts
```

### 🔄 **Data Migration System**
```typescript
// Migration Service (lib/migration-service.ts)
class MigrationService {
  static needsMigration(): boolean         # Check if localStorage data exists
  static testConnection(): Promise<boolean> # Test database connectivity
  static migrate(): Promise<MigrationResult> # Full migration process
  static clearLocalStorage(): void        # Clean up after migration
  static restoreFromBackup(): boolean     # Rollback if needed
  static getMigrationStatus(): MigrationStatus # Check migration state
}

// Migration Process
1. Check for localStorage data (habits, habitEntries)
2. Test database connection
3. Migrate habits first (get new UUIDs)
4. Map old IDs to new IUIDs for entries
5. Bulk migrate entries with proper relationships
6. Backup original data before clearing localStorage
7. Mark migration complete with timestamp
```

### ⚙️ **Nginx Configuration**
```nginx
# Features
- Static file serving for Next.js frontend
- API reverse proxy to backend
- Gzip compression and caching
- Security headers (XSS, CSRF protection)
- Rate limiting (API: 10r/s, General: 1r/s)
- SSL/HTTPS support (configurable)
- Health check endpoints
- CORS handling for API requests

# Performance Optimizations
- Static asset caching (1 year for immutable assets)
- API response caching (1 minute for health checks)
- Gzip compression for text assets
- Connection keep-alive and HTTP/2 support
```

### 🛠️ **Management Tools**
```bash
# Docker Management Script (docker-manage.sh)
./docker-manage.sh start       # Start all services
./docker-manage.sh stop        # Stop all services
./docker-manage.sh restart     # Restart services
./docker-manage.sh build       # Build containers
./docker-manage.sh rebuild     # Rebuild from scratch
./docker-manage.sh logs        # View logs
./docker-manage.sh logs-f      # Follow logs
./docker-manage.sh status      # Container status
./docker-manage.sh health      # Health check all services
./docker-manage.sh backup      # Database backup
./docker-manage.sh restore     # Database restore
./docker-manage.sh clean       # Clean up containers
./docker-manage.sh db-shell    # Connect to database
./docker-manage.sh backend-shell # Connect to backend
```

### 🔒 **Security Features**
- **Input Validation**: Comprehensive validation using express-validator
- **SQL Injection Protection**: Parameterized queries with pg library
- **Rate Limiting**: API and general request limits via nginx
- **CORS Protection**: Properly configured for frontend domain
- **Security Headers**: XSS protection, content type sniffing prevention
- **Container Security**: Non-root users in all containers
- **Connection Limits**: Per-IP connection limiting
- **Error Handling**: Secure error responses without data leakage

### 📊 **Monitoring & Health Checks**
```json
// Health Check Response
{
  "status": "healthy",
  "timestamp": "2025-06-24T22:06:54.627Z", 
  "uptime": "5s",
  "database": "connected",
  "memory": {"used": "13MB", "total": "31MB"},
  "version": "1.0.0"
}

// Container Health Checks
- Database: pg_isready check every 10s
- Backend: HTTP health endpoint every 30s  
- Nginx: HTTP status check every 30s
- Redis: Redis ping check every 10s
```

### 🔧 **Environment Configuration**
```bash
# Database
DB_HOST=postgres
DB_USER=habitflow_user
DB_PASSWORD=habitflow_password
DB_NAME=habitflow

# Backend
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost

# Frontend  
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 🎯 **Production Ready Features**
- **SSL/HTTPS Support**: Ready for production certificates
- **Database Backups**: Automated backup system with restore capability
- **Scaling Ready**: Can handle multiple backend instances with load balancing
- **Performance Monitoring**: Built-in metrics and health endpoints
- **Error Logging**: Comprehensive logging throughout the stack
- **Graceful Shutdown**: Proper cleanup on container stop
- **Resource Optimization**: Efficient memory and CPU usage

### 🔄 **Migration Path for Users**
1. **Seamless Transition**: Frontend detects localStorage data on first load
2. **Migration Prompt**: User gets option to migrate to database backend
3. **Automatic Process**: Migration happens automatically with progress feedback
4. **Data Backup**: Original localStorage data is backed up before migration
5. **Rollback Option**: Users can restore localStorage data if needed
6. **Zero Data Loss**: Complete preservation of habits, entries, and settings

### 📝 **Next.js Configuration Updates**
```javascript
// next.config.js - Updated for static export
const nextConfig = {
  output: 'export',           # Static export for Nginx serving
  trailingSlash: true,        # Nginx-friendly URLs
  images: { unoptimized: true }, # No image optimization for static
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  }
}
```

### 🧪 **Testing & Verification**
- ✅ **Database Initialization**: All tables, indexes, triggers created successfully
- ✅ **API Endpoints**: Full CRUD operations tested and working
- ✅ **Health Monitoring**: All health checks passing
- ✅ **Migration Service**: LocalStorage to database migration tested
- ✅ **Docker Orchestration**: All containers start, stop, and restart properly
- ✅ **Sample Data**: Pre-configured habits and settings available
- ✅ **Error Handling**: Graceful degradation and proper error responses

## Recent Updates & Improvements (Latest Sessions)

### 🔧 **Header Refactor & `shadcn/ui` Consolidation (Current Session)**
- **Header Redesign**: Refactored the main header to a compact, single-row layout for a more modern look.
- **`shadcn/ui` Components**: Replaced all instances of native `<button>` and `<input>` elements with their `shadcn/ui` counterparts for a consistent design system.
- **`ToggleGroup` Navigation**: Implemented the `ToggleGroup` component for the main view switcher, improving semantics and user experience.

### 🎯 **Habit Categories Optimization (Current Session)**
- **Research-Based Categories**: Updated categories based on popular habit tracking apps research
- **Category Changes**:
  - Replaced "Work" → "Productivity" (⚡ focus, efficiency, goal achievement)
  - Replaced "Personal" → "Mindfulness" (🧘 meditation, gratitude, mental wellbeing)
  - Added "Finance" (💰 budgeting, saving, financial goals)
  - Added "Home" (🏠 cleaning, organization, maintenance)
  - Kept: Health (🏥), Fitness (💪), Learning (📚), Social (👥), Creative (🎨), Other (📝)
- **UI Improvements**: Enhanced habit card sizing and visual hierarchy
  - Larger icons (w-12 h-12), bigger titles (text-lg font-semibold)
  - Enhanced day indicators (w-14 h-14) with better visual feedback
  - Improved badge sizing and typography for better readability
  - Increased card padding for better spacing and visual balance

### 🎨 **Previous UI/UX Redesign (2024-2025 Modern Trends)**
- **Motivational Quotes Strip**: Added top-of-page inspirational quotes with auto-rotation (15s intervals)
- **Habit Card Redesign**: Complete horizontal layout overhaul
  - Icon + title on left, 7-day indicators in center, menu on right
  - ~60% height reduction while maintaining all functionality
  - Modern day indicators with gradients, shadows, and micro-animations
- **AI Component Optimization**: 
  - Moved to bottom of page for better hierarchy (habits get primary focus)
  - Reduced height by 50% with scrollable containers (`max-h-32`)
  - Fixed background color consistency with main theme
- **Enhanced Notifications**: 
  - Auto-setup reminders for new habits
  - Improved settings panel with manual reminder configuration
  - Daily motivation quote notifications

### 🔧 **Technical Improvements**
- **Controllable Components**: Made AddHabitForm externally controllable for better UX
- **Layout Hierarchy**: Reordered components (Stats → Habits → AI) for optimal focus
- **Modern Animations**: Spring-based physics, hover lift effects, rotating check icons
- **Accessibility**: Larger hit targets, better contrast, clearer visual hierarchy
- **Performance**: Reduced animation complexity, optimized rendering
- **Category System**: Comprehensive update to align with industry-standard habit categories

### 🔧 **Docker Frontend Build Optimization (Latest Session)**
- **Fixed Next.js Export**: Removed deprecated `npm run export` command - Next.js 15 with `output: 'export'` handles static generation automatically
- **Corrected Volume Mapping**: Fixed Docker volume conflicts that caused "EBUSY" errors during build
- **Optimized Build Process**: Streamlined frontend-build container to use proper shared volume mounting
- **Nginx Integration**: Updated nginx configuration to serve static files from correct volume path
- **Build Verification**: Confirmed successful static export with all assets (index.html, _next/, 404.html) properly generated
- **Production Ready**: Frontend now fully operational via nginx at `http://localhost` with backend API proxy working

### 🎯 **Design System Updates**
- **Day Indicators**: Vertical stack layout (labels above indicators)
- **State Visualization**: 
  - Completed: Green gradient with shadow glow
  - Today: Primary color with border ring and shadow
  - Incomplete: Muted with subtle dot, hover effects
- **Color-Adaptive Interactions**: Dynamic shadows using each habit's custom color
- **Modern Skeuomorphism**: Subtle depth, gradients, and contemporary aesthetics
- **Enhanced Typography**: Improved font weights and sizing throughout habit cards

### 📊 **User Experience Enhancements**
- **Better Information Density**: More habits visible without scrolling
- **Clearer Visual Hierarchy**: Primary content (habits) gets focus, AI is secondary
- **Improved Scanning**: Horizontal layout makes it easier to review multiple habits
- **Enhanced Feedback**: Better completion states and interactive animations
- **Motivational Elements**: Inspirational quotes and enhanced streak visualization
- **Industry-Standard Categories**: Aligned with most popular habit tracking patterns