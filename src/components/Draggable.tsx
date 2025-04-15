import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

type BlinkState = 'resting' | 'listening' | 'processing' | 'feedback'

// Define props type
interface DraggableProps {
  isDragging: boolean;
  currentTarget: 'top' | 'bottom' | 'left' | 'right';
}

export function Draggable({ isDragging, currentTarget }: DraggableProps) {
  const [state, setState] = useState<BlinkState>('resting')
  const [textWidth, setTextWidth] = useState(0)
  const textRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverOpacity, setHoverOpacity] = useState(0)

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

  // Animate hover background opacity when hover state changes
  useEffect(() => {
    if (isHovering && state === 'resting' && !isDragging) {
      setHoverOpacity(0.2)
    } else {
      setHoverOpacity(0)
    }
  }, [isHovering, state, isDragging])

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
    if (textRef.current && state === 'feedback') {
      setTextWidth(textRef.current.offsetWidth)
    } else {
      setTextWidth(0)
    }
  }, [state])

  return (
    <div className="relative flex items-center justify-center">
      {/* Tooltip - Only visible when hovering in resting state AND not dragging */}
      <AnimatePresence>
        {isHovering && isResting && !isDragging && (
          <motion.div
            className={clsx(
              'absolute bg-white/20 rounded-md shadow-md px-3 py-2 flex items-center justify-center pointer-events-none',
              currentTarget === 'top' && 'top-[24px]',
              currentTarget === 'bottom' && 'bottom-[24px]',
              currentTarget === 'left' && 'left-[24px]',
              currentTarget === 'right' && 'right-[24px]'
            )}
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              x: currentTarget === 'left' ? 6 : currentTarget === 'right' ? -6 : 0,
              y: currentTarget === 'top' ? -6 : currentTarget === 'bottom' ? -6 : 0
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: 0,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              x: currentTarget === 'left' ? 6 : currentTarget === 'right' ? -6 : 0,
              y: currentTarget === 'top' ? -6 : currentTarget === 'bottom' ? -6 : 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30 
            }}
            style={{
              zIndex: 30,
              width: 'max-content',
              transformOrigin: 
                currentTarget === 'top' ? 'bottom center' :
                currentTarget === 'bottom' ? 'bottom center' :
                currentTarget === 'left' ? 'left center' :
                'right center'
            }}
          >
            <span className="text-white text-[12px]" style={{ fontWeight: 550, lineHeight: '100%' }}>Press P to start recording</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer hover background wrapper */}
      <div 
        className="relative"
        onMouseEnter={() => !isDragging && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Hover/Drag background circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
          animate={{
            backgroundColor: isDragging
              ? 'rgba(255,255,255,0.5)'       // Half opacity while dragging
              : isHovering && state === 'resting'
              ? 'rgba(255,255,255,0.2)'     // Hover state opacity
              : 'rgba(255,255,255,0)'       // Default transparent
          }}
          transition={{
            type: "spring", 
            stiffness: 200, 
            damping: 25
          }}
          style={{ zIndex: 0, pointerEvents: 'none' }}
        />

        {/* Main animated container */}
        <motion.div
          className={clsx(
            'backdrop-blur-[5px] rounded-full flex items-center justify-center relative',
            state === 'feedback' ? 'text-[#f7f7f7]/60' : 'text-[#f7f7f7]',
            'font-["SF_Pro",sans-serif] text-[12px] font-normal tracking-normal'
          )}
          animate={{
            width: isDragging ? 24 : isResting ? 16 : isListeningOrProcessing ? 32 : textWidth + 56,
            height: isDragging ? 24 : isResting ? 16 : isListeningOrProcessing ? 32 : 36,
            paddingLeft: isDragging ? 0 : state === 'feedback' ? 28 : 0,
            paddingRight: isDragging ? 0 : state === 'feedback' ? 28 : 0,
            paddingTop: isDragging ? 0 : state === 'feedback' ? 11 : 0,
            paddingBottom: isDragging ? 0 : state === 'feedback' ? 11 : 0,
            x: isDragging ? 0 : isResting 
               ? 0 
               : currentTarget === 'left'
                 ? 0 // No X offset for left, expand to the right 
                 : currentTarget === 'right'
                   ? -(isListeningOrProcessing ? 16 : textWidth + 40) // Move left for right position
                   : isListeningOrProcessing 
                     ? -(32 - 16) / 2  // Center the expansion: (larger size - smaller size) / 2
                     : -(textWidth + 56 - 16) / 2,  // Center feedback text
            y: isDragging ? 0 : isResting 
               ? 0 
               : currentTarget === 'top'
                 ? 20  // Move DOWN by 20px when in top position
                 : currentTarget === 'left' || currentTarget === 'right'
                   ? isListeningOrProcessing 
                     ? -(32 - 16) / 2  // Center vertically for listening/processing
                     : -(36 - 16) / 2  // Center vertically for feedback
                   : -20  // Move UP by 20px for bottom position
          }}
          style={{
            transformOrigin: currentTarget === 'top' 
              ? 'center bottom' 
              : currentTarget === 'left'
                ? 'left center'  // Origin on the left side when in left position
                : currentTarget === 'right'
                  ? 'right center' // Origin on the right side when in right position
                  : 'center center',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
            backgroundColor: isFeedback ? 'rgba(0, 0, 0, 0.16)' : 'rgba(0, 0, 0, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            outline: 'none',
            position: 'relative',
            right: currentTarget === 'right' && (isListeningOrProcessing || isFeedback) ? 0 : 'auto',
            left: currentTarget === 'left' && (isListeningOrProcessing || isFeedback) ? 0 : 'auto'
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
                <div className="relative flex items-center justify-center">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="absolute bg-[#D9D9D9] rounded-full w-[4px] h-[4px]"
                      animate={{ 
                        x: state === 'listening' ? 0 : (index - 1) * 6,
                        scale: state === 'listening' ? [1, 2.25, 1] : 1,
                        opacity: state === 'listening' ? 1 : [0.6, 1, 0.6]
                      }}
                      transition={{
                        x: {
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        },
                        scale: state === 'listening' ? {
                          repeat: Infinity,
                          duration: 1.5,
                          times: [0, 0.5, 1],
                          ease: "easeInOut"
                        } : {
                          duration: 0.4,
                          ease: [0.25, .46, .45, .94]
                        },
                        opacity: state === 'listening' ? {
                          duration: 0.2
                        } : {
                          repeat: Infinity,
                          duration: 0.8,
                          delay: index * 0.15,
                          times: [0, 0.5, 1],
                          ease: [0.23, 1, 0.32, 1]
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
                <div className="relative flex items-center justify-center">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="absolute bg-[#D9D9D9] rounded-full w-[4px] h-[4px]"
                      initial={{ x: 0 }}
                      animate={{ 
                        x: (index - 1) * 6,
                        scale: 1,
                        y: ["0%", "-100%", "0%"],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        x: {
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        },
                        y: {
                          repeat: Infinity,
                          duration: 0.8,
                          delay: index * 0.15,
                          times: [0, 0.5, 1],
                          ease: [0.23, 1, 0.32, 1]
                        },
                        opacity: {
                          repeat: Infinity,
                          duration: 0.8,
                          delay: index * 0.15,
                          times: [0, 0.5, 1],
                          ease: [0.23, 1, 0.32, 1]
                        }
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : state === 'feedback' ? (
              <motion.span 
                className="inline-block whitespace-nowrap"
                initial={{ 
                  opacity: 0,
                  x: currentTarget === 'left' || currentTarget === 'right' ? 0 : undefined
                }}
                animate={{ opacity: 1 }}
                exit={{ 
                  opacity: 0,
                  transition: { duration: 0 }
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                ref={textRef}
                style={{
                  lineHeight: '100%',
                }}
              >
                Copied to clipboard
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
} 