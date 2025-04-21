
"use client"
import Confetti from 'react-confetti'
import useWindowSize from '@/hooks/useWindowSize'


export default function ConfettiComponent() {
  const { width, height } = useWindowSize()

  return (
    <Confetti
      width={width || 300}    // Fallback width
      height={height || 300}  // Fallback height
    />
  )
}
