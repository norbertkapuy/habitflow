
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie-consent')
      if (!consent) {
        setVisible(true)
      }
    } catch (error) {
      console.error('Could not access localStorage:', error)
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie-consent', 'true')
      setVisible(false)
    } catch (error) {
      console.error('Could not set localStorage item:', error)
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                This website uses cookies to ensure you get the best experience. By continuing to use this site, you agree to our use of cookies.
              </p>
              <Button onClick={handleAccept} size="sm">
                Accept
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
