'use client'

import { signIn, useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Globe, Rocket } from "lucide-react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/farm-selection')
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center space-y-8 max-w-md luxury-bg luxury-shadow-lg rounded-lg p-8">
        {/* Logo/Icon */}
        <div className="flex justify-center items-center space-x-4">
          <Globe className="w-16 h-16 text-yellow-600" />
          <Rocket className="w-12 h-12 text-yellow-700" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-orbitron luxury-accent">
            FARM QUEST
          </h1>
          <p className="text-lg text-gray-700">
            NASA Space Apps Challenge 2025
          </p>
          <p className="text-sm text-gray-600 font-mono">
            Choose your farm. Save the world.
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={() => signIn('google')}
          className="w-full premium-gradient text-white font-mono font-bold py-4 px-8 
                     border-2 border-yellow-600 hover:bg-transparent hover:text-yellow-600 
                     transition-all duration-300 luxury-shadow rounded-md"
        >
          LOGIN WITH GOOGLE
        </button>

        {/* Footer */}
        <div className="text-xs text-gray-400 font-mono space-y-1">
          <p>// Powered by NASA Earth Data</p>
          <p>// Built for Space Apps Hackathon</p>
        </div>
      </div>
    </div>
  )
}