"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Trophy, Sparkles, Users } from "lucide-react"

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

// Traditional Snake and Ladder positions based on the board image
const snakesAndLadders = {
  // Ladders (bottom -> top)
  1: 38,
  4: 14,
  9: 31,
  16: 6,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,

  // Snakes (head -> tail)
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
}

const playerColors = [
  { color: "bg-red-500", name: "Red", textColor: "text-red-500" },
  { color: "bg-blue-500", name: "Blue", textColor: "text-blue-500" },
  { color: "bg-green-500", name: "Green", textColor: "text-green-500" },
  { color: "bg-yellow-500", name: "Yellow", textColor: "text-yellow-500" },
]

export default function SnakeLadderGame() {
  const [numPlayers, setNumPlayers] = useState(2)
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [winner, setWinner] = useState(null)
  const [showWinner, setShowWinner] = useState(false)
  const [gameLog, setGameLog] = useState([])

  const initializeGame = (playerCount) => {
    const gamePlayers = playerColors.slice(0, playerCount).map((colorConfig, index) => ({
      id: index + 1,
      name: colorConfig.name,
      color: colorConfig.color,
      textColor: colorConfig.textColor,
      position: 0,
    }))
    setPlayers(gamePlayers)
    setGameStarted(true)
    setGameLog([`Game started with ${playerCount} players!`])
  }

  const addToLog = (message) => {
    setGameLog((prev) => [...prev.slice(-4), message])
  }

  const rollDice = () => {
    if (isRolling || winner) return

    setIsRolling(true)

    let rollCount = 0
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
      rollCount++

      if (rollCount >= 15) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        setDiceValue(finalValue)
        setIsRolling(false)
        movePlayer(finalValue)
      }
    }, 80)
  }

  const movePlayer = (steps) => {
    const currentPlayer = players[currentPlayerIndex]
    let newPosition = currentPlayer.position + steps

    // Can't go beyond 100
    if (newPosition > 100) {
      addToLog(`${currentPlayer.name} rolled ${steps} but can't move beyond 100!`)
      nextPlayerTurn()
      return
    }

    addToLog(`${currentPlayer.name} rolled ${steps} and moved to ${newPosition}`)

    // Check for snakes and ladders
    if (snakesAndLadders[newPosition]) {
      const destination = snakesAndLadders[newPosition]
      if (destination > newPosition) {
        addToLog(`🪜 Ladder! ${currentPlayer.name} climbed from ${newPosition} to ${destination}`)
      } else {
        addToLog(`🐍 Snake! ${currentPlayer.name} slid from ${newPosition} to ${destination}`)
      }
      newPosition = destination
    }

    // Update player position
    const updatedPlayers = [...players]
    updatedPlayers[currentPlayerIndex] = { ...currentPlayer, position: newPosition }
    setPlayers(updatedPlayers)

    // Check for winner
    if (newPosition === 100) {
      setWinner(currentPlayer)
      setShowWinner(true)
      addToLog(`🏆 ${currentPlayer.name} wins the game!`)
      return
    }

    nextPlayerTurn()
  }

  const nextPlayerTurn = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
  }

  const resetGame = () => {
    setGameStarted(false)
    setPlayers([])
    setCurrentPlayerIndex(0)
    setDiceValue(1)
    setWinner(null)
    setShowWinner(false)
    setGameLog([])
  }

  const getSquareNumber = (row, col) => {
    // Snake pattern: odd rows go left to right, even rows go right to left
    if (row % 2 === 1) {
      return (10 - row) * 10 + col + 1
    } else {
      return (10 - row) * 10 + (10 - col)
    }
  }

  const getSquareStyle = (squareNumber) => {
    const hasSnakeOrLadder = snakesAndLadders[squareNumber]
    const isSnake = hasSnakeOrLadder && hasSnakeOrLadder < squareNumber
    const isLadder = hasSnakeOrLadder && hasSnakeOrLadder > squareNumber

    let bgColor = "bg-white"
    if (squareNumber === 1) bgColor = "bg-green-100"
    else if (squareNumber === 100) bgColor = "bg-yellow-100"
    else if (isSnake) bgColor = "bg-red-100"
    else if (isLadder) bgColor = "bg-blue-100"

    return bgColor
  }

  const DiceIcon = diceIcons[diceValue - 1]

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <img
                src="/snake-ladder-board.png"
                alt="Snake Ladder Board"
                className="w-32 h-32 mx-auto mb-4 rounded-lg"
              />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Snake & Ladder</h1>
              <p className="text-gray-600">Choose number of players</p>
            </div>

            <div className="space-y-4">
              {[2, 3, 4].map((count) => (
                <Button
                  key={count}
                  onClick={() => {
                    setNumPlayers(count)
                    initializeGame(count)
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {count} Players
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/game-selection")}
              className="w-full mt-4"
            >
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/game-selection")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Snake & Ladder</h1>
          <Button variant="ghost" onClick={resetGame} className="text-white hover:bg-white/20">
            New Game
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-4">
                <div className="aspect-square bg-white rounded-lg p-2">
                  <div className="grid grid-cols-10 gap-1 h-full">
                    {Array.from({ length: 10 }, (_, row) =>
                      Array.from({ length: 10 }, (_, col) => {
                        const squareNumber = getSquareNumber(row, col)
                        const hasSnakeOrLadder = snakesAndLadders[squareNumber]
                        const isSnake = hasSnakeOrLadder && hasSnakeOrLadder < squareNumber
                        const isLadder = hasSnakeOrLadder && hasSnakeOrLadder > squareNumber

                        return (
                          <div
                            key={`${row}-${col}`}
                            className={`
                              relative aspect-square border border-gray-300 flex items-center justify-center text-xs font-bold
                              ${getSquareStyle(squareNumber)}
                            `}
                          >
                            {/* Square number */}
                            <span className="absolute top-0 left-0 text-[8px] p-0.5 text-gray-600">{squareNumber}</span>

                            {/* Snake or Ladder indicator */}
                            {isSnake && <span className="text-red-500 text-lg">🐍</span>}
                            {isLadder && <span className="text-blue-500 text-lg">🪜</span>}

                            {/* Player tokens */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex flex-wrap gap-0.5">
                                {players
                                  .filter((p) => p.position === squareNumber)
                                  .map((player, index) => (
                                    <motion.div
                                      key={player.id}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className={`w-2 h-2 ${player.color} rounded-full border border-white`}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        )
                      }),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls */}
          <div className="space-y-4">
            {/* Current Player */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold mb-2">Current Player</h3>
                <div className={`w-8 h-8 rounded-full ${players[currentPlayerIndex]?.color} mx-auto mb-2`} />
                <p className="font-semibold">{players[currentPlayerIndex]?.name}</p>
                <p className="text-sm text-gray-600">
                  Position:{" "}
                  {players[currentPlayerIndex]?.position === 0 ? "Start" : players[currentPlayerIndex]?.position}
                </p>
              </CardContent>
            </Card>

            {/* Dice */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <motion.div
                  animate={isRolling ? { rotate: 360 } : {}}
                  transition={{ duration: 0.1, repeat: isRolling ? Number.POSITIVE_INFINITY : 0 }}
                  className="mb-4"
                >
                  <DiceIcon className="w-16 h-16 mx-auto text-blue-600" />
                </motion.div>
                <Button
                  onClick={rollDice}
                  disabled={isRolling || !!winner}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isRolling ? "Rolling..." : "Roll Dice"}
                </Button>
              </CardContent>
            </Card>

            {/* Players Status */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3">Players</h3>
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${player.color}`} />
                      <span className={`text-sm font-medium ${currentPlayerIndex === index ? "font-bold" : ""}`}>
                        {player.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{player.position === 0 ? "Start" : player.position}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Game Log */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3">Game Log</h3>
                <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                  {gameLog.map((log, index) => (
                    <div key={index} className="text-gray-600">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Rules */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">How to Play</h3>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>• Roll dice to move forward</p>
                  <p>• 🪜 Ladders take you up</p>
                  <p>• 🐍 Snakes bring you down</p>
                  <p>• First to reach 100 wins!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowWinner(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <div className="text-6xl">🏆</div>
              </div>

              <h2 className="text-2xl font-bold mb-2">{winner?.name} Wins!</h2>

              <div className="flex space-x-2 justify-center mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <Trophy className="w-6 h-6 text-yellow-500" />
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>

              <p className="text-gray-600 mb-6">Congratulations! You reached 100 first!</p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowWinner(false)
                    resetGame()
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  New Game
                </Button>
                <Button variant="outline" onClick={() => setShowWinner(false)} className="w-full">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
