"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  alt?: string
  width?: number
  height?: number
  className?: string
}

export const Logo = ({
  alt = "Logo",
  width = 150,
  height = 32,
  className
}: LogoProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use resolvedTheme to handle system preference
  const currentTheme = mounted ? resolvedTheme : 'light'
  const logoSrc = currentTheme === 'dark' ? '/logo_dark.svg' : '/logo.svg'

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}