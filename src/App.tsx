import { useState, useEffect, useRef } from 'react'
import { TextBlink } from './components/TextBlink'
import { TextBlinkFeedback2 } from './components/TextBlinkFeedback2'
import { TextShimmer } from './components/TextShimmer'
import { SMWaveAndSpinner } from './components/SMWaveAndSpinner'
import { LGWaveAndSpinner } from './components/LGWaveAndSpinner'
import { SMDotAndTyping } from './components/SMDotAndTyping'
import { LGDotAndTyping } from './components/LGDotAndTyping'
import { Draggable } from './components/Draggable'
import { motion, AnimatePresence, useAnimate, useMotionValue, animate } from 'framer-motion'
import './App.css'

const components = [
  { name: 'TextBlink', component: TextBlink },
  { name: 'TextBlinkFeedback2', component: TextBlinkFeedback2 },
  { name: 'TextShimmer', component: TextShimmer },
  { name: 'SMWaveAndSpinner', component: SMWaveAndSpinner },
  { name: 'LGWaveAndSpinner', component: LGWaveAndSpinner },
  { name: 'SMDotAndTyping', component: SMDotAndTyping },
  { name: 'LGDotAndTyping', component: LGDotAndTyping },
  { name: 'Draggable', component: Draggable }
]

// Define target area properties
const containerWidth = 640;
const containerHeight = 480;
const targetOffset = 16; // 16px from edge
const targetRadius = 8; // half of 16x16 target size
const draggableRadius = 8; // half of 16x16 draggable hover area size - Used for hover logic
const dotRadius = 8; // half of 16x16 resting state size - Used for centering calculations

const targets = {
  top: { 
    x: containerWidth / 2, 
    y: targetOffset + targetRadius 
  },
  bottom: { 
    x: containerWidth / 2, 
    y: containerHeight - targetOffset - targetRadius 
  },
  left: { 
    x: targetOffset + targetRadius, 
    y: containerHeight / 2 
  },
  right: { 
    x: containerWidth - targetOffset - targetRadius, 
    y: containerHeight / 2 
  },
};

// Calculate top-left coordinates needed to center the 6x6 DOT on each target center
const snapPositions = {
  top: { 
    x: targets.top.x - dotRadius, 
    y: targets.top.y - dotRadius 
  }, 
  bottom: { 
    x: targets.bottom.x - dotRadius, 
    y: targets.bottom.y - dotRadius 
  }, 
  left: { 
    x: targets.left.x - dotRadius, 
    y: targets.left.y - dotRadius 
  }, 
  right: { 
    x: targets.right.x - dotRadius, 
    y: targets.right.y - dotRadius 
  }, 
};

function App() {
  const [currentIndex, setCurrentIndex] = useState(components.findIndex(c => c.name === 'TextBlink'));
  const [isPKeyPressed, setIsPKeyPressed] = useState(false);
  const [isLeftKeyPressed, setIsLeftKeyPressed] = useState(false);
  const [isRightKeyPressed, setIsRightKeyPressed] = useState(false);
  const CurrentComponent = components[currentIndex].component;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Replace state variables with motion values
  const [currentTarget, setCurrentTarget] = useState<keyof typeof snapPositions>('bottom');
  const [isDragging, setIsDragging] = useState(false);
  const [closestTargetKeyDuringDrag, setClosestTargetKeyDuringDrag] = useState<string | null>(null);
  
  // Create motion values for x and y
  const x = useMotionValue(snapPositions.bottom.x);
  const y = useMotionValue(snapPositions.bottom.y);
  
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

  // Function to find closest target (used in onDrag and onDragEnd)
  const findClosestTarget = (currentX: number, currentY: number): keyof typeof snapPositions => {
    const currentDotCenterX = currentX + dotRadius;
    const currentDotCenterY = currentY + dotRadius;
    let closestKey: keyof typeof snapPositions = 'bottom';
    let minDist = Infinity;
    for (const [key, target] of Object.entries(targets)) {
      const dx = currentDotCenterX - target.x;
      const dy = currentDotCenterY - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closestKey = key as keyof typeof snapPositions;
      }
    }
    return closestKey;
  };

  const handleDragStart = () => {
    setIsDragging(true);
    // No need to reset hover state here as it's handled in the Draggable component
  };

  const handleDrag = (e: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const draggedX = info.point.x - containerRect.left - dotRadius;
    const draggedY = info.point.y - containerRect.top - dotRadius;
    
    // Find closest target
    const closestKey = findClosestTarget(draggedX, draggedY);
    setClosestTargetKeyDuringDrag(closestKey);
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const draggedX = info.point.x - containerRect.left - dotRadius;
    const draggedY = info.point.y - containerRect.top - dotRadius;
    
    // Find closest target
    const closestTargetKey = findClosestTarget(draggedX, draggedY);
    
    // Update current target first
    setCurrentTarget(closestTargetKey);
    
    // Animate explicitly both axes using MotionValues
    animate(x, snapPositions[closestTargetKey].x, { type: 'spring', stiffness: 500, damping: 30 });
    animate(y, snapPositions[closestTargetKey].y, { type: 'spring', stiffness: 500, damping: 30 });
    
    // Reset drag state with a small delay to prevent immediate hover triggering
    setTimeout(() => {
      setIsDragging(false);
      setClosestTargetKeyDuringDrag(null);
    }, 100);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#F7F7F2] flex flex-col items-center justify-center">
      {/* Main Container */}
      <div 
        ref={containerRef}
        className="w-[640px] h-[480px] bg-[#1A1815] rounded-[32px] relative mb-3 overflow-hidden"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.16)'
        }}
      >
        {/* Conditional Rendering: Draggable layout vs Others */}
        {components[currentIndex].name === 'Draggable' ? (
          <>
            {/* Title (inside main container) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
              draggable
            </div>

            {/* Drop Areas (Animated Opacity & Border) */}
            {(Object.keys(targets) as Array<keyof typeof targets>).map((key) => {
              const isClosest = isDragging && key === closestTargetKeyDuringDrag;
              return (
                <motion.div
                  key={key}
                  className={`absolute w-4 h-4 rounded-full border`}
                  style={{ // Set position dynamically based on key
                    top: key === 'top' ? `${targetOffset}px` : key === 'bottom' ? undefined : '50%',
                    bottom: key === 'bottom' ? `${targetOffset}px` : undefined,
                    left: key === 'left' ? `${targetOffset}px` : key === 'right' ? undefined : '50%',
                    right: key === 'right' ? `${targetOffset}px` : undefined,
                    transform: key === 'top' || key === 'bottom' ? 'translateX(-50%)' : key === 'left' || key === 'right' ? 'translateY(-50%)' : 'translate(-50%, -50%)',
                  }}
                  animate={{
                    opacity: isDragging ? 1 : 0,
                    borderColor: isClosest ? 'rgba(255, 255, 255, 1)' : 'rgba(107, 114, 128, 0.5)', // gray-600/50
                    borderStyle: isClosest ? 'solid' : 'dashed',
                  }}
                  transition={{ duration: 0.1 }} // Quick transition for opacity/border
                />
              )}
            )}
            
            {/* Draggable Component Wrapper */}
            <motion.div 
              className="w-auto h-auto cursor-grab"
              style={{ 
                position: 'absolute',
                x,
                y,
                outline: 'none'
              }}
              drag
              dragConstraints={{
                left: 0,
                right: containerWidth - 16,
                top: 0,
                bottom: containerHeight - 16
              }}
              dragElastic={0}
              dragMomentum={false}
              whileTap={{ cursor: "grabbing" }}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            >
              <Draggable isDragging={isDragging} currentTarget={currentTarget} />
            </motion.div>
          </>
        ) : (
          <>
            {/* Component Name (for non-draggable components) */}
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

            {/* Component Container - Centered (for non-draggable components) */}
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
                  <CurrentComponent isDragging={false} currentTarget="bottom" />
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Dot Navigation */}
      <div className="flex justify-center gap-1 mb-6 relative z-50">
        {components.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="w-2 h-2 rounded-full cursor-pointer hover:scale-110 transition-transform"
            style={{
              background: index === currentIndex 
                ? 'black'
                : '#D6D6C6',
              border: 'none',
              outline: 'none',
              padding: 0
            }}
          />
        ))}
      </div>

      {/* Instructions Text Container */}
      <div className="text-center flex flex-col items-center gap-2.5"> 
        {/* P Key Hint */}
        <span className="text-[#666] text-[18px] font-semibold font-['SF_Pro'] tracking-tight inline-flex items-center gap-1.5">
          Press
          <motion.span
            className="inline-flex items-center justify-center rounded-[9px]" 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '9px',
              minWidth: '30px',
              height: '30px',
              fontSize: '21px',
              fontWeight: 600,
              lineHeight: '1',
              color: '#333',
              padding: '0 6px',
              margin: '0 3px',
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
        <span className="text-[#666] text-[18px] font-semibold font-['SF_Pro'] tracking-tight inline-flex items-center gap-1.5">
          Use
          <motion.span // Left Arrow Hint
            className="inline-flex items-center justify-center rounded-[9px]" 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '9px',
              width: '30px', // Fixed width
              height: '30px',
              fontSize: '15px', // Smaller font for triangle
              fontWeight: 600,
              lineHeight: '1',
              color: '#333',
              padding: '0', // No padding needed for centered triangle
              margin: '0 3px',
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
            className="inline-flex items-center justify-center rounded-[9px]" 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '9px',
              width: '30px', // Fixed width
              height: '30px',
              fontSize: '15px', // Smaller font for triangle
              fontWeight: 600,
              lineHeight: '1',
              color: '#333',
              padding: '0',
              margin: '0 3px',
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

        {/* Drag Hint - Always shown but with opacity based on current component */}
        <motion.span 
          className="text-[#666] text-[18px] font-semibold font-['SF_Pro'] tracking-tight inline-flex items-center gap-1.5"
          animate={{
            opacity: components[currentIndex].name === 'Draggable' ? 1 : 0
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          Try to 
          <motion.span
            className="inline-flex items-center justify-center rounded-[9px]" 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              borderRadius: '9px',
              minWidth: '30px',
              height: '30px',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '1',
              color: '#333',
              padding: '0 9px',
              margin: '0 3px',
            }}
            animate={{
              scale: isDragging ? 1.2 : 1,
              rotate: isDragging ? -4 : 0,
              backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.12)'
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15
            }}
          >
            drag
          </motion.span>
          the component!
        </motion.span>
      </div>
    </div>
  )
}

export default App
