'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function ThreeDCard({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      className={cn("relative rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-300 ease-out", className)}
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{
        scale: 1.03,
        boxShadow: '0px 20px 40px -15px hsla(var(--primary), 0.2)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
