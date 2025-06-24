export interface NotificationSchedule {
  id: string
  habitId: string
  time: string
  frequency: 'daily' | 'weekly' | 'none'
  enabled: boolean
}

class NotificationService {
  private static instance: NotificationService
  private schedules: NotificationSchedule[] = []
  private intervalId: NodeJS.Timeout | null = null

  private constructor() {
    this.loadSchedules()
    if (typeof window !== 'undefined') {
      this.startScheduler()
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async scheduleHabitReminder(habitId: string, habitName: string, time: string, frequency: 'daily' | 'weekly' = 'daily'): Promise<void> {
    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      throw new Error('Notification permission denied')
    }

    const schedule: NotificationSchedule = {
      id: `${habitId}-${Date.now()}`,
      habitId,
      time,
      frequency,
      enabled: true
    }

    // Remove existing schedule for this habit
    this.schedules = this.schedules.filter(s => s.habitId !== habitId)
    
    // Add new schedule
    this.schedules.push(schedule)
    this.saveSchedules()

    console.log(`Scheduled notification for ${habitName} at ${time}`)
  }

  removeHabitReminder(habitId: string): void {
    this.schedules = this.schedules.filter(s => s.habitId !== habitId)
    this.saveSchedules()
  }

  showNotification(title: string, body: string, icon?: string): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      // Fallback to browser alert or custom UI notification
      this.showBrowserAlert(title, body)
      return
    }

    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'habit-reminder',
      requireInteraction: false,
      silent: false
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  private showBrowserAlert(title: string, body: string): void {
    // Create a custom notification UI element
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 z-50 max-w-sm p-4 bg-card border rounded-lg shadow-lg transition-all duration-300 transform translate-x-full'
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span class="text-sm">🔔</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground">${title}</p>
          <p class="text-sm text-muted-foreground">${body}</p>
        </div>
        <button class="flex-shrink-0 text-muted-foreground hover:text-foreground">
          <span class="sr-only">Close</span>
          ✕
        </button>
      </div>
    `

    document.body.appendChild(notification)

    // Slide in animation
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)'
    })

    // Add close functionality
    const closeBtn = notification.querySelector('button')
    closeBtn?.addEventListener('click', () => {
      this.hideCustomNotification(notification)
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      this.hideCustomNotification(notification)
    }, 5000)
  }

  private hideCustomNotification(element: HTMLElement): void {
    element.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    }, 300)
  }

  private startScheduler(): void {
    // Check every minute for due notifications
    this.intervalId = setInterval(() => {
      this.checkDueNotifications()
    }, 60000) // 60 seconds
  }

  private checkDueNotifications(): void {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.

    this.schedules.forEach(schedule => {
      if (!schedule.enabled) return

      const shouldNotify = 
        schedule.time === currentTime &&
        (schedule.frequency === 'daily' || 
         (schedule.frequency === 'weekly' && currentDay === 1)) // Monday for weekly

      if (shouldNotify) {
        this.sendHabitReminder(schedule.habitId)
      }
    })
  }

  private async sendHabitReminder(habitId: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      
      // Get habit details from storage
      const habits = JSON.parse(localStorage.getItem('habits') || '[]')
      const habit = habits.find((h: any) => h.id === habitId)
      
      if (!habit) return

      const title = '🎯 Habit Reminder'
      const body = `Time to work on "${habit.name}"!`
      
      this.showNotification(title, body)
    } catch (error) {
      console.error('Error sending habit reminder:', error)
    }
  }

  private loadSchedules(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('notification-schedules')
        if (saved) {
          this.schedules = JSON.parse(saved)
        }
      }
    } catch (error) {
      console.error('Error loading notification schedules:', error)
      this.schedules = []
    }
  }

  private saveSchedules(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('notification-schedules', JSON.stringify(this.schedules))
      }
    } catch (error) {
      console.error('Error saving notification schedules:', error)
    }
  }

  getSchedules(): NotificationSchedule[] {
    return [...this.schedules]
  }

  updateScheduleStatus(scheduleId: string, enabled: boolean): void {
    const schedule = this.schedules.find(s => s.id === scheduleId)
    if (schedule) {
      schedule.enabled = enabled
      this.saveSchedules()
    }
  }

  // Test notification
  testNotification(): void {
    this.showNotification(
      '🧪 Test Notification',
      'This is a test notification to verify your settings are working correctly!'
    )
  }

  // Daily motivation quote
  showDailyMotivation(): void {
    const quotes = [
      "The secret of getting ahead is getting started.",
      "Small daily improvements lead to staggering long-term results.",
      "Success is the sum of small efforts repeated day in and day out.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "You don't have to be great to get started, but you have to get started to be great."
    ]
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    this.showNotification('💪 Daily Motivation', randomQuote)
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

export const notificationService = NotificationService.getInstance()