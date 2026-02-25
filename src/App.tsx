/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridConfig, setGridConfig] = useState({ cols: 0, rows: 0, d: 64 });
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    const calculateGrid = () => {
      if (!containerRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const d = width < 640 ? 48 : 64; 
      
      const cols = Math.floor((3 * width / d - 1) / 4);
      const rows = Math.floor((3 * height / d - 1) / 4);
      
      setGridConfig({ 
        cols: Math.max(0, cols), 
        rows: Math.max(0, rows), 
        d 
      });
    };

    window.addEventListener('resize', calculateGrid);
    calculateGrid();
    
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    // Find the element at the current pointer position
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const coinElement = target?.closest('[data-coin-id]');
    
    if (coinElement) {
      const id = parseInt(coinElement.getAttribute('data-coin-id') || '', 10);
      setActiveId(id);
    } else {
      setActiveId(null);
    }
  };

  const totalCoins = gridConfig.cols * gridConfig.rows;

  return (
    <div className="bg-white min-h-screen">
      {/* Interactive Grid Section */}
      <div 
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center touch-pan-y select-none"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActiveId(null)}
        style={{
          padding: `${gridConfig.d / 3}px`,
        }}
      >
        <div 
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridConfig.cols}, ${gridConfig.d}px)`,
            gridTemplateRows: `repeat(${gridConfig.rows}, ${gridConfig.d}px)`,
            gap: `${gridConfig.d / 3}px`,
            width: 'fit-content',
            height: 'fit-content'
          }}
        >
          {Array.from({ length: totalCoins }).map((_, i) => (
            <div 
              key={i} 
              data-coin-id={i}
              style={{ width: gridConfig.d, height: gridConfig.d }}
            >
              <Coin size={gridConfig.d} isActive={activeId === i} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const Coin = ({ size, isActive }: { size: number; isActive: boolean }) => {
  const [isMouseHovered, setIsMouseHovered] = useState(false);

  // Combine mouse hover and pointer-swipe active state
  const isFlipped = isMouseHovered || isActive;

  return (
    <div 
      className="relative cursor-pointer perspective-1000"
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsMouseHovered(true)}
      onMouseLeave={() => setIsMouseHovered(false)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          mass: 1
        }}
      >
        {/* The Blue Edge/Core */}
        <div className="absolute inset-0 rounded-full bg-[#447AF7]" />
        
        {/* Front Side - White with Blue Stroke */}
        <div 
          className="absolute inset-0 rounded-full bg-white border-[2.66px] border-[#447AF7]"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'translateZ(3px)' 
          }}
        />

        {/* Back Side - Yellow with Blue Stroke */}
        <div 
          className="absolute inset-0 rounded-full bg-[#EECC2D] border-[2.66px] border-[#447AF7]"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(3px)'
          }}
        />
      </motion.div>
    </div>
  );
};
