import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

type BlinkState = 'resting' | 'listening' | 'processing' | 'feedback'

export function SMWaveAndSpinner() {
  const [state, setState] = useState<BlinkState>('resting')
  const [textWidth, setTextWidth] = useState(0)
  const textRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const nextState = () => {
    const states: BlinkState[] = ['resting', 'listening', 'processing', 'feedback']
    const nextIndex = (states.indexOf(state) + 1) % states.length
    setState(states[nextIndex])
  }

  // Handle keyboard events for state transitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p' && state === 'resting') {
        // Clear any existing timeouts
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        
        // Go to state 2 (listening) when P is pressed
        setState('listening')
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p' && state === 'listening') {
        // Go to state 3 (processing) when P is released
        setState('processing')
        
        // After 0.8 seconds, go to state 4 (feedback)
        timeoutRef.current = window.setTimeout(() => {
          setState('feedback')
          
          // After 1 second, go back to state 1 (resting)
          timeoutRef.current = window.setTimeout(() => {
            setState('resting')
          }, 1000)
        }, 800)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      
      // Clear any existing timeouts when component unmounts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [state])

  // Add a separate effect to handle the transition from processing to feedback
  useEffect(() => {
    if (state === 'processing') {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      
      // Set a timeout to transition to feedback state after 0.8 seconds
      timeoutRef.current = window.setTimeout(() => {
        setState('feedback')
        
        // After 1 second, go back to resting state
        timeoutRef.current = window.setTimeout(() => {
          setState('resting')
        }, 1000)
      }, 800)
      
      // Clean up the timeout when the component unmounts or state changes
      return () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }
      }
    }
  }, [state])

  // Add a separate effect to handle the transition from feedback to resting
  useEffect(() => {
    if (state === 'feedback') {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      
      // Set a timeout to transition back to resting state after 1 second
      timeoutRef.current = window.setTimeout(() => {
        setState('resting')
      }, 1000)
      
      // Clean up the timeout when the component unmounts or state changes
      return () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }
      }
    }
  }, [state])

  const isResting = state === 'resting'
  const isListeningOrProcessing = state === 'listening' || state === 'processing'
  const isFeedback = state === 'feedback'
  const label =
    state === 'listening'
      ? ''
      : state === 'processing'
      ? ''
      : state === 'feedback'
      ? 'Copied to clipboard'
      : ''

  // Update text width when label changes
  useEffect(() => {
    if (textRef.current && !isResting) {
      setTextWidth(textRef.current.offsetWidth)
    }
  }, [label, isResting])

  return (
    <div className="relative h-[42px] flex items-center justify-center">
      <motion.div
        className={clsx(
          'backdrop-blur-[5px] bg-black/28 rounded-full flex items-center justify-center relative',
          state === 'feedback' ? 'text-[#f7f7f7]/60' : 'text-[#f7f7f7]',
          'font-["SF_Pro",sans-serif] text-[12px] font-normal tracking-normal'
        )}
        animate={{
          width: isResting ? 6 : isListeningOrProcessing ? 32 : textWidth + 48,
          height: isResting ? 6 : isListeningOrProcessing ? 32 : 36,
          paddingLeft: isResting ? 0 : isListeningOrProcessing ? 0 : 24,
          paddingRight: isResting ? 0 : isListeningOrProcessing ? 0 : 24,
          paddingTop: isResting ? 0 : isListeningOrProcessing ? 0 : 11,
          paddingBottom: isResting ? 0 : isListeningOrProcessing ? 0 : 11,
          y: isResting ? 0 : -24
        }}
        style={{
          transformOrigin: 'center top',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
          backgroundColor: isFeedback ? 'rgba(0, 0, 0, 0.16)' : 'rgba(0, 0, 0, 0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
      >
        <AnimatePresence mode="wait">
          {state === 'listening' ? (
            <motion.div 
              className="w-[32px] h-[32px] flex items-center justify-center"
              initial={{ 
                scale: 0.8,
                opacity: 0 
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0.8,
                opacity: 0
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="w-[20px] h-[8px] flex items-center gap-[1px]">
                {[6, 5, 4, 3, 2, 1, 0].map((phase, index) => (
                  <motion.div
                    key={index}
                    className="w-[2px] rounded-[99px] bg-[#D9D9D9]"
                    initial={{ 
                      height: 4,
                      scale: 0.8,
                      opacity: 0 
                    }}
                    animate={{
                      height: [4, 8, 4],
                      scale: 1,
                      opacity: 1
                    }}
                    exit={{
                      scale: 0.8,
                      opacity: 0
                    }}
                    transition={{
                      height: {
                        repeat: Infinity,
                        duration: 1,
                        ease: "easeInOut",
                        delay: -phase * 0.15
                      },
                      scale: {
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      },
                      opacity: {
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : state === 'processing' ? (
            <motion.div 
              className="w-[32px] h-[32px] flex items-center justify-center"
              initial={{ 
                scale: 0.8,
                opacity: 0 
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                scale: 0.8,
                opacity: 0
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <motion.svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12"
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 0.8,
                  ease: "linear",
                  repeat: Infinity
                }}
              >
                <circle
                  cx="6"
                  cy="6"
                  r="5"
                  fill="none"
                  stroke="#D9D9D9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="25 8"
                />
              </motion.svg>
            </motion.div>
          ) : !isResting && (
            <motion.span 
              className="inline-block whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0 }
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              ref={textRef}
              style={{
                lineHeight: '1.2',
                transform: 'translateY(0.5px)'
              }}
            >
              Copied to clipboard
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <style>
        {`
          /* Removed wave animation */
        `}
      </style>
    </div>
  )
} 