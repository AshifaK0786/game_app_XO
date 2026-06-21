"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Cat, Dog, Rabbit, Fish, Bird, Turtle } from "lucide-react"

const avatars = [
  { icon: User, name: "Player", color: "bg-blue-500" },
  { icon: Cat, name: "Cat", color: "bg-orange-500" },
  { icon: Dog, name: "Dog", color: "bg-brown-500" },
  { icon: Rabbit, name: "Rabbit", color: "bg-pink-500" },
  { icon: Fish, name: "Fish", color: "bg-cyan-500" },
  { icon: Bird, name: "Bird", color: "bg-yellow-500" },
  { icon: Turtle, name: "Turtle", color: "bg-green-500" },
]

export default function ProfileSetup() {
  const [username, setUsername] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(0)

  const handleContinue = () => {
    if (username.trim()) {
      localStorage.setItem(
        "gameProfile",
        JSON.stringify({
          username: username.trim(),
          avatar: selectedAvatar,
        }),
      )
      window.location.href = "/games/xo"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl mx-4">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Create Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div>
              <Label htmlFor="username" className="text-base sm:text-lg font-medium">
                Choose Your Name
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="mt-2 text-sm sm:text-base p-2 sm:p-3 border-2 border-gray-200 focus:border-purple-400"
                maxLength={15}
              />
            </div>

            <div>
              <Label className="text-base sm:text-lg font-medium mb-3 sm:mb-4 block">Pick Your Avatar</Label>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {avatars.map((avatar, index) => {
                  const IconComponent = avatar.icon
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedAvatar(index)}
                      className={`p-2 sm:p-3 rounded-full ${avatar.color} ${
                        selectedAvatar === index ? "ring-4 ring-purple-400 ring-offset-2" : ""
                      }`}
                    >
                      <IconComponent className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleContinue}
                disabled={!username.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 sm:py-3 text-sm sm:text-lg rounded-lg disabled:opacity-50"
              >
                Start Playing XO
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
