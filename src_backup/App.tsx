import { useState, useEffect } from 'react'
import { TextBlink } from './components/TextBlink'
import { TextBlinkFeedback2 } from './components/TextBlinkFeedback2'
import { TextShimmer } from './components/TextShimmer'
import { SMWaveAndSpinner } from './components/SMWaveAndSpinner'
import { LGWaveAndSpinner } from './components/LGWaveAndSpinner'
import { SMDotAndTyping } from './components/SMDotAndTyping'
import { LGDotAndTyping } from './components/LGDotAndTyping'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

const components = [
  { name: 'TextBlink', component: TextBlink },
  { name: 'TextBlinkFeedback2', component: TextBlinkFeedback2 },
  { name: 'TextShimmer', component: TextShimmer },
  { name: 'SMWaveAndSpinner', component: SMWaveAndSpinner },
  { name: 'LGWaveAndSpinner', component: LGWaveAndSpinner },
  { name: 'SMDotAndTyping', component: SMDotAndTyping },
  { name: 'LGDotAndTyping', component: LGDotAndTyping }
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPKeyPressed, setIsPKeyPressed] = useState(false)
  const [isLeftKeyPressed, setIsLeftKeyPressed] = useState(false)
  const [isRightKeyPressed, setIsRightKeyPressed] = useState(false)
  const CurrentComponent = components[currentIndex].component

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  // Handle keyboard navigation and key press states
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'arrowleft') {
        setCurrentIndex(prev => (prev - 1 + components.length) % components.length)
        setIsLeftKeyPressed(true)
      } else if (key === 'arrowright') {
        setCurrentIndex(prev => (prev + 1) % components.length)
        setIsRightKeyPressed(true)
      } else if (key === 'p') {
        setIsPKeyPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'arrowleft') {
        setIsLeftKeyPressed(false)
      } else if (key === 'arrowright') {
        setIsRightKeyPressed(false)
      } else if (key === 'p') {
        setIsPKeyPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#F7F7F2] flex flex-col items-center justify-center">
      {/* Dot Navigation */}
      <div className="flex justify-center gap-3 mb-6 relative z-50">
        {components.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="w-2 h-2 rounded-full cursor-pointer hover:scale-110 transition-transform"
            style={{
              background: index === currentIndex 
                ? 'radial-gradient(circle at center, black 30%, rgba(0,0,0,0.8) 60%, transparent 100%)'
                : 'radial-gradient(circle at center, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.1) 60%, transparent 100%)',
              border: 'none',
              outline: 'none',
              padding: 0
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div 
        className="w-[640px] h-[480px] bg-[#131313] rounded-[32px] relative mb-8"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.16)'
        }}
      >
        {/* Component Name */}
        <div className="absolute top-3 left-0 right-0 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[#f7f7f7]/60 text-[15px] font-normal tracking-tight"
            >
              {components[currentIndex].name.toLowerCase()}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Component Container - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="w-[300px] flex justify-center"
            >
              <CurrentComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions Text Container */}
      <div className="text-center flex flex-col items-center gap-1.5"> 
        {/* P Key Hint */}
        <span className="text-[#666] text-[12px] font-semibold font-['SF_Pro'] tracking-tight inline-flex items-center gap-1">
          Press
          <motion.span
            className="inline-flex items-center justify-center rounded-[6px]" 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '6px',
              minWidth: '20px',
              height: '20px',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '1',
              color: '#333',
              padding: '0 4px',
              margin: '0 2px',
            }}
            animate={{
              scale: isPKeyPressed ? 1.2 : 1,
              rotate: isPKeyPressed ? -4 : 0
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15
            }}
          >
            P
          </motion.span>
          to try it out.
        </span>

        {/* Arrow Key Hint */}
        <span className="text-[#666] text-[12px] font-semibold font-['SF_Pro'] tracking-tight inline-flex items-center gap-1">
          Use
          <motion.span // Left Arrow Hint
            className="inline-flex items-center justify-center rounded-[6px]" 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '6px',
              width: '20px', // Fixed width
              height: '20px',
              fontSize: '10px', // Smaller font for triangle
              fontWeight: 600,
              lineHeight: '1',
              color: '#333',
              padding: '0', // No padding needed for centered triangle
              margin: '0 2px',
            }}
            animate={{
              scale: isLeftKeyPressed ? 1.2 : 1,
              rotate: isLeftKeyPressed ? -4 : 0
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15
            }}
          >
            ◀
          </motion.span>
          &
          <motion.span // Right Arrow Hint
            className="inline-flex items-center justify-center rounded-[6px]" 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '6px',
              width: '20px', // Fixed width
              height: '20px',
              fontSize: '10px', // Smaller font for triangle
              fontWeight: 600,
              lineHeight: '1',
              color: '#333',
              padding: '0',
              margin: '0 2px',
            }}
            animate={{
              scale: isRightKeyPressed ? 1.2 : 1,
              rotate: isRightKeyPressed ? 4 : 0 // Rotate right
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15
            }}
          >
            ▶
          </motion.span>
          to navigate between variants.
        </span>
      </div>
    </div>
  )
}

export default App
