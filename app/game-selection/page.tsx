"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Settings } from "lucide-react"

const games = [
  {
    id: "xo",
    title: "XO Game",
    emoji: "❌⭕",
    description: "Classic Tic Tac Toe",
    color: "from-red-400 to-pink-500",
    route: "/games/xo",
  },
  {
    id: "snake-ladder",
    title: "Snake & Ladder",
    emoji: "🐍🪜",
    description: "Climb up, slide down!",
    color: "from-green-400 to-blue-500",
    route: "/games/snake-ladder",
  },
  {
    id: "ludo",
    title: "Ludo",
    emoji: "🎲",
    description: "Race to home!",
    color: "from-yellow-400 to-orange-500",
    route: "/games/ludo",
  },
]

export default function GameSelection() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem("gameProfile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center space-x-3"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{profile?.username || "Player"}</h2>
            <p className="text-white/80 text-sm">Choose your game</p>
          </div>
        </motion.div>

        <Button variant="ghost" className="text-white">
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      {/* Games Grid */}
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold text-white text-center mb-8"
        >
          Select a Game
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-br ${game.color} p-6 text-center`}>
                    <div className="text-6xl mb-4">{game.emoji}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                    <p className="text-white/90">{game.description}</p>
                  </div>
                  <div className="p-4">
                    <Button
                      onClick={() => (window.location.href = game.route)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Play Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
