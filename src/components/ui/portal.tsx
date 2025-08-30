'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
}

export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)
  const [portalRoot, setPortalRoot] = useState<Element | null>(null)

  useEffect(() => {
    setMounted(true)
    const root = document.getElementById('modal-root') || document.body
    setPortalRoot(root)
    return () => setMounted(false)
  }, [])

  if (!mounted || !portalRoot) return null

  return createPortal(children, portalRoot)
}