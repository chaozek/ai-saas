import Image from "next/image"
import { useEffect, useState } from "react"

export const MessageLoading = () => {
     const messages = [
          "Generování...",
          "Přemýšlím...",
          "Analyzuji...",
          "Zpracovávám...",
          "Vytvářím...",
          "Připravuji...",
          "Načítám...",
     ]
     const [currentMessagesIndex, setCurrentMessagesIndex] = useState(0)

     useEffect(() => {
          const interval = setInterval(() => {
               setCurrentMessagesIndex((prev) => (prev + 1) % messages.length)
          }, 1000)
          return () => clearInterval(interval)
     }, [messages.length])
          const shimmerMessages = <p className="text-sm text-muted-foreground animate-pulse">{messages[currentMessagesIndex]}</p>
     return <div className="flex gap-2 justify-center items-center p-4">
          <Image src="/logo.svg" alt="Načítání" width={18} height={18} className="w-4 h-4" />
          {shimmerMessages}
     </div>
}