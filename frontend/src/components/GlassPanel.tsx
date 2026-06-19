import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
}

function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return <div className={`glass-panel ${className}`}>{children}</div>
}

export default GlassPanel
