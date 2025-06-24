'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save } from 'lucide-react'
import { Habit } from '@/lib/types'
import { saveHabits, getHabits } from '@/lib/storage'

interface EditHabitFormProps {
  habit: Habit
  onClose: () => void
  onUpdate: () => void
}

const categories = [
  'Health', 'Fitness', 'Mindfulness', 'Productivity', 'Learning', 'Finance', 'Social', 'Home', 'Creative', 'Other'
]

const colors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

export function EditHabitForm({ habit, onClose, onUpdate }: EditHabitFormProps) {
  const [name, setName] = useState(habit.name)
  const [description, setDescription] = useState(habit.description || '')
  const [category, setCategory] = useState(habit.category)
  const [color, setColor] = useState(habit.color)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    
    try {
      const habits = getHabits()
      const updatedHabits = habits.map(h => 
        h.id === habit.id 
          ? { ...h, name: name.trim(), description: description.trim(), category, color }
          : h
      )
      
      saveHabits(updatedHabits)
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Failed to update habit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Habit</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Habit Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter habit name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you want to achieve?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c) => (
                    <motion.button
                      key={c}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        color === c ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}