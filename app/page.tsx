"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gamepad2, Sparkles, Star } from "lucide-react"

export default function WelcomeScreen() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleEnterApp = () => {
    window.location.href = "/profile-setup"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 600),
              scale: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: 360,
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 600),
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          >
            <Star className="w-4 h-4 text-white/30" />
          </motion.div>
        ))}
      </div>

      <Card className="relative z-10 p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.5 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            XO Game
          </motion.h1>
        </motion.div>

        {showContent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-gray-600 mb-8 text-lg">
              Play classic Tic Tac Toe!
              <br />
              <span className="text-sm">❌⭕ Challenge friends or AI</span>
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleEnterApp}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-xl rounded-full shadow-lg"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Let's Play!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </Card>
    </div>
  )
}
