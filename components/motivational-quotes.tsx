'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const motivationalQuotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Small daily improvements lead to staggering long-term results.",
    author: "Robin Sharma"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "You don't have to be great to get started, but you have to get started to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "Excellence is not a single act, but a habit. You are what you repeatedly do.",
    author: "Shaquille O'Neal"
  },
  {
    text: "Progress, not perfection, is the goal.",
    author: "Unknown"
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  },
  {
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "Your habits will determine your future.",
    author: "Jack Canfield"
  }
]

interface MotivationalQuotesProps {
  className?: string
}

export function MotivationalQuotes({ className = "" }: MotivationalQuotesProps) {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Auto-rotate quotes every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length)
        setIsVisible(true)
      }, 400)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  // Get random quote on mount
  useEffect(() => {
    setCurrentQuote(Math.floor(Math.random() * motivationalQuotes.length))
  }, [])

  const nextQuote = () => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length)
      setIsVisible(true)
    }, 400)
  }

  const quote = motivationalQuotes[currentQuote]

  return (
    <motion.div 
      className={`w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Quote content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary/70" />
            </div>
            
            <AnimatePresence mode="wait">
              {isVisible && (
                <motion.div
                  key={currentQuote}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-2 min-w-0 flex-1"
                >
                  <span className="text-sm font-medium text-muted-foreground italic truncate">
                    "{quote.text}"
                  </span>
                  <span className="text-xs text-muted-foreground/70 font-medium whitespace-nowrap">
                    — {quote.author}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Progress dots */}
            <div className="hidden sm:flex items-center gap-1">
              {motivationalQuotes.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(() => {
                      setCurrentQuote(index)
                      setIsVisible(true)
                    }, 400)
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    index === currentQuote % 5
                      ? 'bg-primary/70'
                      : 'bg-primary/20 hover:bg-primary/40'
                  }`}
                />
              ))}
            </div>
            
            {/* Refresh button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={nextQuote}
              className="h-6 w-6 p-0 text-primary/70 hover:text-primary hover:bg-primary/10"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}