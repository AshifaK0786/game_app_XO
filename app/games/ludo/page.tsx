"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Trophy, Sparkles } from "lucide-react"

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

// Traditional Ludo board path (52 squares around the board)
const boardPath = Array.from({ length: 52 }, (_, i) => i + 1)

// Safe zones (star positions)
const safeZones = [1, 9, 14, 22, 27, 35, 40, 48]

// Player configurations matching traditional Ludo
const playerConfigs = [
  {
    id: 1,
    name: "Red",
    color: "bg-red-500",
    textColor: "text-red-500",
    startSquare: 1,
    homeEntry: 51,
    homeColumn: [51, 52, 53, 54, 55, 56],
  },
  {
    id: 2,
    name: "Green",
    color: "bg-green-500",
    textColor: "text-green-500",
    startSquare: 14,
    homeEntry: 12,
    homeColumn: [12, 11, 10, 9, 8, 7],
  },
  {
    id: 3,
    name: "Yellow",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    startSquare: 27,
    homeEntry: 25,
    homeColumn: [25, 24, 23, 22, 21, 20],
  },
  {
    id: 4,
    name: "Blue",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    startSquare: 40,
    homeEntry: 38,
    homeColumn: [38, 37, 36, 35, 34, 33],
  },
]

export default function LudoGame() {
  const [numPlayers, setNumPlayers] = useState(2)
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [winner, setWinner] = useState(null)
  const [showWinner, setShowWinner] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [movableTokens, setMovableTokens] = useState([])
  const [gameLog, setGameLog] = useState([])
  const [consecutiveSixes, setConsecutiveSixes] = useState(0)

  const initializeGame = (playerCount) => {
    const gamePlayers = playerConfigs.slice(0, playerCount).map((config) => ({
      ...config,
      tokens: [
        { id: 1, position: "base", boardPosition: 0, homePosition: 0 },
        { id: 2, position: "base", boardPosition: 0, homePosition: 0 },
        { id: 3, position: "base", boardPosition: 0, homePosition: 0 },
        { id: 4, position: "base", boardPosition: 0, homePosition: 0 },
      ],
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
    setSelectedToken(null)

    let rollCount = 0
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
      rollCount++

      if (rollCount >= 15) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        setDiceValue(finalValue)
        setIsRolling(false)
        handleDiceRoll(finalValue)
      }
    }, 80)
  }

  const handleDiceRoll = (diceVal) => {
    const currentPlayer = players[currentPlayerIndex]
    addToLog(`${currentPlayer.name} rolled ${diceVal}`)

    // Check for three consecutive sixes
    if (diceVal === 6) {
      setConsecutiveSixes((prev) => prev + 1)
      if (consecutiveSixes >= 2) {
        addToLog(`${currentPlayer.name} rolled 3 sixes! Turn forfeited.`)
        setConsecutiveSixes(0)
        nextPlayerTurn()
        return
      }
    } else {
      setConsecutiveSixes(0)
    }

    // Find movable tokens
    const movable = currentPlayer.tokens.filter((token, index) => {
      if (token.position === "base") {
        return diceVal === 6
      }
      if (token.position === "home") {
        return false
      }
      if (token.position === "homeColumn") {
        return token.homePosition + diceVal <= 6
      }
      return true
    })

    setMovableTokens(movable)

    if (movable.length === 0) {
      addToLog(`${currentPlayer.name} has no valid moves!`)
      setTimeout(() => {
        if (diceVal !== 6) {
          nextPlayerTurn()
        }
      }, 1500)
    } else if (movable.length === 1) {
      // Auto-move if only one token can move
      setTimeout(() => {
        moveToken(movable[0], diceVal)
      }, 800)
    }
  }

  const moveToken = (token, steps) => {
    const currentPlayer = players[currentPlayerIndex]
    const tokenIndex = currentPlayer.tokens.findIndex((t) => t.id === token.id)

    if (tokenIndex === -1) return

    const updatedPlayers = [...players]
    const updatedToken = { ...token }

    if (token.position === "base" && steps === 6) {
      // Move from base to start square
      updatedToken.position = "board"
      updatedToken.boardPosition = currentPlayer.startSquare
      addToLog(`${currentPlayer.name} token ${token.id} entered the board!`)

      // Check if landing on opponent token
      checkCapture(currentPlayer.startSquare, currentPlayer.id, updatedPlayers)
    } else if (token.position === "board") {
      let newPosition = token.boardPosition + steps

      // Handle board wrapping
      if (newPosition > 52) {
        newPosition = newPosition - 52
      }

      // Check if token should enter home column
      if (
        newPosition === currentPlayer.homeEntry ||
        (token.boardPosition < currentPlayer.homeEntry && newPosition > currentPlayer.homeEntry)
      ) {
        updatedToken.position = "homeColumn"
        updatedToken.homePosition = steps - (currentPlayer.homeEntry - token.boardPosition)
        if (updatedToken.homePosition > 6) {
          // Can't move, stay in same position
          addToLog(`${currentPlayer.name} token ${token.id} can't move - would overshoot home!`)
          return
        }
        addToLog(`${currentPlayer.name} token ${token.id} entered home column!`)
      } else {
        updatedToken.boardPosition = newPosition
        addToLog(`${currentPlayer.name} token ${token.id} moved to square ${newPosition}`)

        // Check for capture
        checkCapture(newPosition, currentPlayer.id, updatedPlayers)
      }
    } else if (token.position === "homeColumn") {
      const newHomePosition = token.homePosition + steps
      if (newHomePosition === 6) {
        updatedToken.position = "home"
        addToLog(`${currentPlayer.name} token ${token.id} reached HOME!`)
      } else if (newHomePosition < 6) {
        updatedToken.homePosition = newHomePosition
        addToLog(`${currentPlayer.name} token ${token.id} moved in home column`)
      } else {
        addToLog(`${currentPlayer.name} token ${token.id} can't move - would overshoot home!`)
        return
      }
    }

    updatedPlayers[currentPlayerIndex].tokens[tokenIndex] = updatedToken
    setPlayers(updatedPlayers)
    setMovableTokens([])
    setSelectedToken(null)

    // Check for winner
    const allTokensHome = updatedPlayers[currentPlayerIndex].tokens.every((t) => t.position === "home")
    if (allTokensHome) {
      setWinner(currentPlayer)
      setShowWinner(true)
      addToLog(`🏆 ${currentPlayer.name} WINS THE GAME!`)
      return
    }

    // Next turn logic
    if (diceValue !== 6) {
      nextPlayerTurn()
    }
  }

  const checkCapture = (position, currentPlayerId, updatedPlayers) => {
    // Don't capture on safe zones
    if (safeZones.includes(position)) return

    // Check if any opponent token is on this position
    updatedPlayers.forEach((player, playerIndex) => {
      if (player.id !== currentPlayerId) {
        player.tokens.forEach((token, tokenIndex) => {
          if (token.position === "board" && token.boardPosition === position) {
            // Capture the token
            updatedPlayers[playerIndex].tokens[tokenIndex] = {
              ...token,
              position: "base",
              boardPosition: 0,
            }
            addToLog(`${players[currentPlayerIndex].name} captured ${player.name}'s token!`)
          }
        })
      }
    })
  }

  const nextPlayerTurn = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
    setConsecutiveSixes(0)
  }

  const resetGame = () => {
    setGameStarted(false)
    setPlayers([])
    setCurrentPlayerIndex(0)
    setDiceValue(1)
    setWinner(null)
    setShowWinner(false)
    setSelectedToken(null)
    setMovableTokens([])
    setGameLog([])
    setConsecutiveSixes(0)
  }

  const DiceIcon = diceIcons[diceValue - 1]

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <img src="/ludo-board.png" alt="Ludo Board" className="w-32 h-32 mx-auto mb-4 rounded-lg" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Ludo Game</h1>
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
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg"
                >
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-4">
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
          <h1 className="text-2xl font-bold text-white">Ludo Game</h1>
          <Button variant="ghost" onClick={resetGame} className="text-white hover:bg-white/20">
            New Game
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-4">
                <div className="aspect-square bg-white rounded-lg relative overflow-hidden">
                  {/* Traditional Ludo Board Layout */}
                  <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-0">
                    {/* Red Home Area (Top Left) */}
                    <div className="col-span-6 row-span-6 bg-red-500 relative">
                      <div className="absolute inset-4 bg-white rounded-lg">
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 h-full">
                          {players
                            .find((p) => p.name === "Red")
                            ?.tokens.filter((t) => t.position === "base")
                            .map((token, index) => (
                              <motion.button
                                key={token.id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => movableTokens.includes(token) && moveToken(token, diceValue)}
                                className={`
                                bg-red-500 rounded-full aspect-square flex items-center justify-center text-white font-bold
                                ${movableTokens.includes(token) ? "ring-4 ring-yellow-400 cursor-pointer animate-pulse" : ""}
                              `}
                                disabled={!movableTokens.includes(token)}
                              >
                                {token.id}
                              </motion.button>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Green Home Area (Top Right) */}
                    <div className="col-span-6 row-span-6 col-start-10 bg-green-500 relative">
                      <div className="absolute inset-4 bg-white rounded-lg">
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 h-full">
                          {players
                            .find((p) => p.name === "Green")
                            ?.tokens.filter((t) => t.position === "base")
                            .map((token, index) => (
                              <motion.button
                                key={token.id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => movableTokens.includes(token) && moveToken(token, diceValue)}
                                className={`
                                bg-green-500 rounded-full aspect-square flex items-center justify-center text-white font-bold
                                ${movableTokens.includes(token) ? "ring-4 ring-yellow-400 cursor-pointer animate-pulse" : ""}
                              `}
                                disabled={!movableTokens.includes(token)}
                              >
                                {token.id}
                              </motion.button>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Blue Home Area (Bottom Left) */}
                    <div className="col-span-6 row-span-6 row-start-10 bg-blue-500 relative">
                      <div className="absolute inset-4 bg-white rounded-lg">
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 h-full">
                          {players
                            .find((p) => p.name === "Blue")
                            ?.tokens.filter((t) => t.position === "base")
                            .map((token, index) => (
                              <motion.button
                                key={token.id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => movableTokens.includes(token) && moveToken(token, diceValue)}
                                className={`
                                bg-blue-500 rounded-full aspect-square flex items-center justify-center text-white font-bold
                                ${movableTokens.includes(token) ? "ring-4 ring-yellow-400 cursor-pointer animate-pulse" : ""}
                              `}
                                disabled={!movableTokens.includes(token)}
                              >
                                {token.id}
                              </motion.button>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Yellow Home Area (Bottom Right) */}
                    <div className="col-span-6 row-span-6 col-start-10 row-start-10 bg-yellow-500 relative">
                      <div className="absolute inset-4 bg-white rounded-lg">
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 h-full">
                          {players
                            .find((p) => p.name === "Yellow")
                            ?.tokens.filter((t) => t.position === "base")
                            .map((token, index) => (
                              <motion.button
                                key={token.id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => movableTokens.includes(token) && moveToken(token, diceValue)}
                                className={`
                                bg-yellow-500 rounded-full aspect-square flex items-center justify-center text-white font-bold
                                ${movableTokens.includes(token) ? "ring-4 ring-blue-400 cursor-pointer animate-pulse" : ""}
                              `}
                                disabled={!movableTokens.includes(token)}
                              >
                                {token.id}
                              </motion.button>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Center Home Triangle */}
                    <div className="col-span-3 row-span-3 col-start-7 row-start-7 bg-gradient-to-br from-yellow-400 via-red-400 to-blue-400 relative">
                      <div className="absolute inset-2 bg-white rounded-lg flex items-center justify-center">
                        <div className="text-2xl font-bold text-gray-600">🏠</div>
                      </div>
                    </div>

                    {/* Board Path Squares - Simplified representation */}
                    {/* Top row */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={`top-${i}`}
                        className={`col-start-${7 + i} row-start-6 bg-white border border-gray-300 relative flex items-center justify-center text-xs font-bold`}
                      >
                        {safeZones.includes(i + 1) && <span className="absolute top-0 left-0 text-yellow-500">⭐</span>}
                        {/* Show tokens on this square */}
                        {players.map((player) =>
                          player.tokens
                            .filter((token) => token.position === "board" && token.boardPosition === i + 1)
                            .map((token) => (
                              <div
                                key={`${player.id}-${token.id}`}
                                className={`w-3 h-3 ${player.color} rounded-full absolute`}
                              />
                            )),
                        )}
                      </div>
                    ))}
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
                {consecutiveSixes > 0 && <p className="text-sm text-orange-600">Sixes: {consecutiveSixes}/3</p>}
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
                  disabled={isRolling || !!winner || movableTokens.length > 1}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isRolling ? "Rolling..." : movableTokens.length > 1 ? "Choose Token" : "Roll Dice"}
                </Button>
              </CardContent>
            </Card>

            {/* Players Status */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3">Players Status</h3>
                {players.map((player) => (
                  <div key={player.id} className="mb-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-4 h-4 rounded-full ${player.color}`} />
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Base: {player.tokens.filter((t) => t.position === "base").length}</div>
                      <div>Board: {player.tokens.filter((t) => t.position === "board").length}</div>
                      <div>Home: {player.tokens.filter((t) => t.position === "home").length}/4</div>
                    </div>
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

              <h2 className="text-2xl font-bold mb-2">{winner?.name} Player Wins!</h2>

              <div className="flex space-x-2 justify-center mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <Trophy className="w-6 h-6 text-yellow-500" />
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>

              <p className="text-gray-600 mb-6">Congratulations! All tokens reached home!</p>

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
