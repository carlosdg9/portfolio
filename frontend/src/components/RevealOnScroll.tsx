import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
}

function RevealOnScroll({ children, className = '', delay = 0 }: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default RevealOnScroll
