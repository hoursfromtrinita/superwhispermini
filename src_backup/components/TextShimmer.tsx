import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

type BlinkState = 'resting' | 'listening' | 'processing' | 'feedback'

export function TextShimmer() {
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
      ? 'Listening'
      : state === 'processing'
      ? 'Processing'
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
          'font-["SF_Pro",sans-serif] text-[15px] font-normal tracking-normal'
        )}
        animate={{
          width: isResting ? 24 : textWidth + 48, // 24px padding on each side
          paddingLeft: isResting ? 0 : 24,
          paddingRight: isResting ? 0 : 24,
          paddingTop: isResting ? 0 : 10, // Reduced top padding
          paddingBottom: isResting ? 1 : 12, // Adjusted bottom padding
          y: isResting ? 0 : -24 // Move up by 24px when not in resting state
        }}
        style={{
          height: isResting ? 6 : 'auto',
          transformOrigin: 'center top',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
          backgroundColor: isFeedback ? 'rgba(0, 0, 0, 0.16)' : 'rgba(0, 0, 0, 0.28)',
          display: 'flex',
          alignItems: 'center' // Ensure vertical centering
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
      >
        <AnimatePresence mode="wait">
          {!isResting && (
            <motion.span 
              ref={textRef}
              className={clsx(
                "whitespace-nowrap",
                isListeningOrProcessing && "text-[#f7f7f7] font-medium shimmer-text"
              )}
              initial={{ 
                scale: 0.8, 
                opacity: 0 
              }}
              animate={{ 
                scale: 1, 
                opacity: 1
              }}
              exit={{ 
                scale: isFeedback ? 1 : 0.8, 
                opacity: 0,
                transition: isFeedback ? { duration: 0 } : undefined
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94] // ease-out-quad
              }}
              style={{
                display: 'inline-block',
                lineHeight: '1.2', // Adjust line height for better vertical centering
                transform: 'translateY(0.5px)', // Fine-tune vertical position
                position: 'relative'
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <style>
        {`
          .shimmer-text {
            background: linear-gradient(
              90deg,
              rgba(247, 247, 247, 0.6) 0%,
              rgba(247, 247, 247, 1) 35%,
              rgba(247, 247, 247, 0.6) 70%
            );
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 1s infinite linear;
          }
          
          @keyframes shimmer {
            0% {
              background-position: 100% 0;
            }
            100% {
              background-position: -100% 0;
            }
          }
        `}
      </style>
    </div>
  )
} 