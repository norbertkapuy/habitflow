'use client'

import { useState } from 'react'
import { Plus, Target, Palette, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { addHabit } from '@/lib/storage'
import { notificationService } from '@/lib/notifications'

interface AddHabitFormProps {
  onHabitAdded: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const HABIT_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
]

const HABIT_CATEGORIES = [
  { value: 'Health', icon: '🏥', description: 'Medical, wellness, nutrition, sleep' },
  { value: 'Fitness', icon: '💪', description: 'Exercise, sports, physical activity' },
  { value: 'Mindfulness', icon: '🧘', description: 'Meditation, gratitude, mental wellbeing' },
  { value: 'Productivity', icon: '⚡', description: 'Focus, efficiency, goal achievement' },
  { value: 'Learning', icon: '📚', description: 'Study, reading, skill development' },
  { value: 'Finance', icon: '💰', description: 'Budgeting, saving, financial goals' },
  { value: 'Social', icon: '👥', description: 'Relationships, networking, community' },
  { value: 'Home', icon: '🏠', description: 'Cleaning, organization, maintenance' },
  { value: 'Creative', icon: '🎨', description: 'Art, writing, music, creativity' },
  { value: 'Other', icon: '📝', description: 'Everything else' },
]

export function AddHabitForm({ onHabitAdded, isOpen: externalIsOpen, onOpenChange }: AddHabitFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(HABIT_CATEGORIES[0].value)
  const [color, setColor] = useState(HABIT_COLORS[0].value)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = onOpenChange || setInternalIsOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newHabit = addHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      color,
      isActive: true,
    })

    // Set up notifications for the new habit if enabled
    try {
      const settings = JSON.parse(localStorage.getItem('habit-tracker-settings') || '{}')
      if (settings.notifications && settings.reminderFrequency !== 'none') {
        await notificationService.scheduleHabitReminder(
          newHabit.id,
          newHabit.name,
          settings.notificationTime || '09:00',
          settings.reminderFrequency || 'daily'
        )
      }
    } catch (error) {
      console.error('Error setting up notifications for new habit:', error)
    }

    setName('')
    setDescription('')
    setCategory(HABIT_CATEGORIES[0].value)
    setColor(HABIT_COLORS[0].value)
    setIsOpen(false)
    onHabitAdded()
  }

  const selectedCategory = HABIT_CATEGORIES.find(cat => cat.value === category)
  const selectedColor = HABIT_COLORS.find(col => col.value === color)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Only show trigger if not externally controlled */}
      {externalIsOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="w-full gap-2" size="lg">
            <Plus className="w-4 h-4" />
            Add New Habit
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create New Habit
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Habit Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink 8 glasses of water"
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your habit"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{selectedCategory?.icon}</span>
                    <span>{selectedCategory?.value}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {HABIT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon}</span>
                      <div>
                        <div className="font-medium">{cat.value}</div>
                        <div className="text-xs text-muted-foreground">{cat.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color Theme
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {HABIT_COLORS.map(colorOption => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                      color === colorOption.value 
                        ? 'border-foreground ring-2 ring-offset-2 ring-foreground/20' 
                        : 'border-muted-foreground/30 hover:border-foreground/50'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  />
                ))}
              </div>
              <Badge variant="outline" className="gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                {selectedColor?.name}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Habit
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}