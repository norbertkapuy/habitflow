'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Palette, 
  Bell, 
  Calendar, 
  Moon, 
  Sun, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getHabits, getHabitEntries, saveHabits, saveHabitEntries } from '@/lib/storage'
import { notificationService } from '@/lib/notifications'
import AIService from '@/lib/ai-service'
import { Brain, Lightbulb, TestTube } from 'lucide-react'

interface SettingsData {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  notificationTime: string
  soundEnabled: boolean
  weekStartsOn: 'sunday' | 'monday'
  defaultView: 'habits' | 'analytics' | 'history'
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

const defaultSettings: SettingsData = {
  theme: 'system',
  notifications: true,
  notificationTime: '09:00',
  soundEnabled: true,
  weekStartsOn: 'monday',
  defaultView: 'habits',
  animationsEnabled: true,
  autoBackup: false,
  streakGoal: 7,
  dailyGoal: 100,
  reminderFrequency: 'daily',
  colorScheme: 'default',
  compactMode: false,
  showMotivationalQuotes: true,
  privateMode: false
}

export function SettingsView() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [aiSettings, setAiSettings] = useState(AIService.getSettings())
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('habit-tracker-settings')
    if (savedSettings) {
      const loadedSettings = { ...defaultSettings, ...JSON.parse(savedSettings) }
      setSettings(loadedSettings)
      
      // Apply all settings on load
      applyTheme(loadedSettings.theme)
      applyColorScheme(loadedSettings.colorScheme)
      applyAnimations(loadedSettings.animationsEnabled)
      applyCompactMode(loadedSettings.compactMode)
    } else {
      // Apply default settings
      applyTheme(defaultSettings.theme)
      applyColorScheme(defaultSettings.colorScheme)
      applyAnimations(defaultSettings.animationsEnabled)
      applyCompactMode(defaultSettings.compactMode)
    }
  }, [])

  const saveSettings = (newSettings: SettingsData) => {
    setSettings(newSettings)
    localStorage.setItem('habit-tracker-settings', JSON.stringify(newSettings))
    
    // Apply all settings immediately
    applyTheme(newSettings.theme)
    applyColorScheme(newSettings.colorScheme)
    applyAnimations(newSettings.animationsEnabled)
    applyCompactMode(newSettings.compactMode)
  }

  const saveAISettings = (newAISettings: Partial<typeof aiSettings>) => {
    const updatedSettings = { ...aiSettings, ...newAISettings }
    setAiSettings(updatedSettings)
    AIService.updateSettings(updatedSettings)
    setConnectionResult(null)
    setConnectionError(null)
  }

  const testAIConnection = async () => {
    setTestingConnection(true)
    setConnectionResult(null)
    setConnectionError(null)
    
    try {
      const isConnected = await AIService.testConnection()
      setConnectionResult(isConnected ? 'success' : 'failed')
    } catch (error) {
      setConnectionResult('error')
      setConnectionError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setTestingConnection(false)
    }
  }

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }

  const applyColorScheme = (colorScheme: string) => {
    const root = window.document.documentElement
    root.classList.remove('color-default', 'color-colorful', 'color-minimal', 'color-high-contrast')
    root.classList.add(`color-${colorScheme}`)
  }

  const applyAnimations = (enabled: boolean) => {
    const root = window.document.documentElement
    if (enabled) {
      root.classList.remove('no-animations')
    } else {
      root.classList.add('no-animations')
    }
  }

  const applyCompactMode = (enabled: boolean) => {
    const root = window.document.documentElement
    if (enabled) {
      root.classList.add('compact-mode')
    } else {
      root.classList.remove('compact-mode')
    }
  }

  const exportData = async () => {
    setIsExporting(true)
    try {
      const habits = getHabits()
      const entries = getHabitEntries()
      const data = {
        habits,
        entries,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.habits) saveHabits(data.habits)
        if (data.entries) saveHabitEntries(data.entries)
        if (data.settings) saveSettings({ ...defaultSettings, ...data.settings })
        
        window.location.reload() // Refresh to apply changes
      } catch (error) {
        console.error('Import failed:', error)
        alert('Failed to import data. Please check the file format.')
      } finally {
        setIsImporting(false)
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete all habits and data? This action cannot be undone.')) {
      localStorage.removeItem('habits')
      localStorage.removeItem('habit_entries')
      localStorage.removeItem('habit-tracker-settings')
      window.location.reload()
    }
  }

  const resetSettings = () => {
    if (confirm('Reset all settings to default values?')) {
      saveSettings(defaultSettings)
    }
  }

  const setupRemindersForAllHabits = async () => {
    try {
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const activeHabits = habits.filter((habit: any) => habit.isActive)
      
      for (const habit of activeHabits) {
        if (settings.reminderFrequency !== 'none') {
          await notificationService.scheduleHabitReminder(
            habit.id,
            habit.name,
            settings.notificationTime || '09:00',
            settings.reminderFrequency || 'daily'
          )
        }
      }
      console.log(`Set up reminders for ${activeHabits.length} habits`)
    } catch (error) {
      console.error('Error setting up reminders for existing habits:', error)
    }
  }

  const requestNotificationPermission = async () => {
    try {
      const hasPermission = await notificationService.requestPermission()
      if (hasPermission) {
        saveSettings({ ...settings, notifications: true })
        
        // Set up reminders for all existing active habits
        await setupRemindersForAllHabits()
        
        // Show test notification
        notificationService.testNotification()
      } else {
        alert('Notifications were denied. You can enable them in your browser settings.')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      alert('Error setting up notifications. Please try again.')
    }
  }

  return (
    <motion.div 
      className="space-y-6 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center">
        <motion.div 
          className="flex items-center justify-center gap-3 mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <div className="p-2 bg-primary/20 dark:bg-primary/30 rounded-lg">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Settings & Preferences</h1>
        </motion.div>
        <p className="text-muted-foreground">
          Customize your habit tracking experience
        </p>
      </div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance & Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    saveSettings({ ...settings, theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select 
                  value={settings.colorScheme} 
                  onValueChange={(value: any) => 
                    saveSettings({ ...settings, colorScheme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="colorful">Colorful</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="high-contrast">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">Enable smooth animations and transitions</p>
              </div>
              <Switch 
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) => 
                  saveSettings({ ...settings, animationsEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
              </div>
              <Switch 
                checked={settings.compactMode}
                onCheckedChange={(checked) => 
                  saveSettings({ ...settings, compactMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications & Reminders */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Get reminders for your habits</p>
              </div>
              <div className="flex items-center gap-2">
                {!settings.notifications && 'Notification' in window && Notification.permission === 'default' && (
                  <Button size="sm" onClick={requestNotificationPermission}>
                    Allow
                  </Button>
                )}
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={(checked) => 
                    saveSettings({ ...settings, notifications: checked })
                  }
                />
              </div>
            </div>

            {settings.notifications && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Reminder Time</Label>
                    <Input
                      type="time"
                      value={settings.notificationTime}
                      onChange={async (e) => {
                        const newTime = e.target.value
                        saveSettings({ ...settings, notificationTime: newTime })
                        
                        // Update all existing reminders with new time
                        if (settings.notifications && settings.reminderFrequency !== 'none') {
                          await setupRemindersForAllHabits()
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reminder Frequency</Label>
                    <Select 
                      value={settings.reminderFrequency} 
                      onValueChange={async (value: any) => {
                        saveSettings({ ...settings, reminderFrequency: value })
                        
                        // Update all existing reminders with new frequency
                        if (settings.notifications) {
                          await setupRemindersForAllHabits()
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">Play sound with notifications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <Switch 
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => 
                        saveSettings({ ...settings, soundEnabled: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Test Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send a test notification to verify settings</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => notificationService.testNotification()}
                    disabled={!settings.notifications}
                  >
                    Send Test
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Daily Motivation</Label>
                    <p className="text-sm text-muted-foreground">Receive daily motivational quotes</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => notificationService.showDailyMotivation()}
                    disabled={!settings.notifications}
                  >
                    Get Quote
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Setup Habit Reminders</Label>
                    <p className="text-sm text-muted-foreground">Configure reminders for all existing habits</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={setupRemindersForAllHabits}
                    disabled={!settings.notifications || settings.reminderFrequency === 'none'}
                  >
                    Setup Reminders
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tracking Preferences */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Tracking Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Week Starts On</Label>
                <Select 
                  value={settings.weekStartsOn} 
                  onValueChange={(value: 'sunday' | 'monday') => 
                    saveSettings({ ...settings, weekStartsOn: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default View</Label>
                <Select 
                  value={settings.defaultView} 
                  onValueChange={(value: any) => 
                    saveSettings({ ...settings, defaultView: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="habits">Habits</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Streak Goal (days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.streakGoal}
                  onChange={(e) => 
                    saveSettings({ ...settings, streakGoal: parseInt(e.target.value) || 7 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Daily Goal (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.dailyGoal}
                  onChange={(e) => 
                    saveSettings({ ...settings, dailyGoal: parseInt(e.target.value) || 100 })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy & Experience */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Private Mode</Label>
                <p className="text-sm text-muted-foreground">Hide habit names in screenshots</p>
              </div>
              <Switch 
                checked={settings.privateMode}
                onCheckedChange={(checked) => 
                  saveSettings({ ...settings, privateMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Motivational Quotes</Label>
                <p className="text-sm text-muted-foreground">Show daily inspiration</p>
              </div>
              <Switch 
                checked={settings.showMotivationalQuotes}
                onCheckedChange={(checked) => 
                  saveSettings({ ...settings, showMotivationalQuotes: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup data weekly</p>
              </div>
              <Switch 
                checked={settings.autoBackup}
                onCheckedChange={(checked) => 
                  saveSettings({ ...settings, autoBackup: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              AI Features
              <Badge variant="secondary" className="text-xs">FREE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable AI Features</Label>
                <p className="text-sm text-muted-foreground">Unlock AI-powered habit suggestions and insights</p>
              </div>
              <Switch 
                checked={aiSettings.enabled}
                onCheckedChange={(checked) => 
                  saveAISettings({ enabled: checked })
                }
              />
            </div>
            
            {aiSettings.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Groq API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter your Groq API key (gsk_...)"
                      value={aiSettings.apiKey}
                      onChange={(e) => saveAISettings({ apiKey: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      onClick={testAIConnection}
                      disabled={testingConnection || !aiSettings.apiKey}
                    >
                      <TestTube className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  {connectionResult && (
                    <div className={`text-sm ${
                      connectionResult === 'success' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {connectionResult === 'success' ? (
                        <p>✓ Connection successful</p>
                      ) : (
                        <div>
                          <p>✗ Connection failed</p>
                          {connectionError && (
                            <p className="text-xs mt-1 font-medium">{connectionError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Get your free API key at{' '}
                      <a 
                        href="https://console.groq.com/keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        console.groq.com/keys
                      </a>
                    </p>
                    <p>
                      ⚡ Groq provides free, ultra-fast AI inference with generous rate limits
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <Select 
                    value={aiSettings.model} 
                    onValueChange={(value: any) => 
                      saveAISettings({ model: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Recommended)</SelectItem>
                      <SelectItem value="llama3-8b-8192">Llama 3 8B (Fast)</SelectItem>
                      <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B (Efficient)</SelectItem>
                      <SelectItem value="gemma2-9b-it">Gemma2 9B (Lightweight)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto Suggestions</Label>
                      <p className="text-sm text-muted-foreground">Generate habit recommendations</p>
                    </div>
                    <Switch 
                      checked={aiSettings.autoSuggestions}
                      onCheckedChange={(checked) => 
                        saveAISettings({ autoSuggestions: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Weekly Insights</Label>
                      <p className="text-sm text-muted-foreground">AI analysis of your progress</p>
                    </div>
                    <Switch 
                      checked={aiSettings.weeklyInsights}
                      onCheckedChange={(checked) => 
                        saveAISettings({ weeklyInsights: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Correlation Analysis</Label>
                      <p className="text-sm text-muted-foreground">Find habit connections</p>
                    </div>
                    <Switch 
                      checked={aiSettings.correlationAnalysis}
                      onCheckedChange={(checked) => 
                        saveAISettings({ correlationAnalysis: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Predictions</Label>
                      <p className="text-sm text-muted-foreground">Future performance insights</p>
                    </div>
                    <Switch 
                      checked={aiSettings.predictionEnabled}
                      onCheckedChange={(checked) => 
                        saveAISettings({ predictionEnabled: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max Suggestions</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={aiSettings.maxSuggestions}
                    onChange={(e) => 
                      saveAISettings({ maxSuggestions: parseInt(e.target.value) || 5 })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={exportData} 
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isImporting}
                />
                <Button 
                  variant="outline" 
                  disabled={isImporting}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-destructive">Danger Zone</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={resetSettings}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Settings
                </Button>

                <Button 
                  variant="destructive" 
                  onClick={clearAllData}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Settings Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Theme: {settings.theme}</Badge>
              <Badge variant="secondary">View: {settings.defaultView}</Badge>
              <Badge variant="secondary">Week: {settings.weekStartsOn}</Badge>
              <Badge variant="secondary">Goal: {settings.dailyGoal}%</Badge>
              <Badge variant="secondary">Streak: {settings.streakGoal} days</Badge>
              {settings.notifications && <Badge variant="default">Notifications On</Badge>}
              {settings.animationsEnabled && <Badge variant="default">Animations On</Badge>}
              {settings.privateMode && <Badge variant="outline">Private Mode</Badge>}
              {aiSettings.enabled && <Badge variant="default" className="bg-purple-500">AI Enabled</Badge>}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}