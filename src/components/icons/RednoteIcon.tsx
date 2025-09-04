import React from 'react'

interface RednoteIconProps {
  className?: string
  width?: number
  height?: number
}

export default function RednoteIcon({ className = '', width = 24, height = 24 }: RednoteIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M8 12h8c0 2.21-1.79 4-4 4s-4-1.79-4-4z"/>
      <path d="M12 8c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z"/>
      <circle cx="9" cy="9" r="1"/>
      <circle cx="15" cy="9" r="1"/>
    </svg>
  )
}