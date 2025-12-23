"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, RotateCcw, Trophy, Sparkles, Bot, User, Home } from "lucide-react"

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
]

export default function XOGame() {
  const [gameMode, setGameMode] = useState(null) // null, 'pvp', 'ai'
  const [board, setBoard] = useState(Array(9).fill(""))
  const [currentPlayer, setCurrentPlayer] = useState("X")
  const [winner, setWinner] = useState(null)
  const [winningPattern, setWinningPattern] = useState([])
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [showWinner, setShowWinner] = useState(false)
  const [isAiTurn, setIsAiTurn] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem("gameProfile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  const checkWinner = (newBoard) => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinningPattern(pattern)
        return newBoard[a]
      }
    }
    if (newBoard.every((cell) => cell !== "")) {
      return "draw"
    }
    return null
  }

  // Minimax AI algorithm
  const minimax = (board, depth, isMaximizing) => {
    const winner = checkWinnerForAI(board)

    if (winner === "O") return 10 - depth
    if (winner === "X") return depth - 10
    if (board.every((cell) => cell !== "")) return 0

    if (isMaximizing) {
      let bestScore = Number.NEGATIVE_INFINITY
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = "O"
          const score = minimax(board, depth + 1, false)
          board[i] = ""
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Number.POSITIVE_INFINITY
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = "X"
          const score = minimax(board, depth + 1, true)
          board[i] = ""
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const checkWinnerForAI = (board) => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  const getBestMove = (board) => {
    let bestScore = Number.NEGATIVE_INFINITY
    let bestMove = 0

    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O"
        const score = minimax(board, 0, false)
        board[i] = ""
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }

  const handleMove = (index) => {
    if (board[index] || winner || isAiTurn) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const gameResult = checkWinner(newBoard)
    if (gameResult) {
      setWinner(gameResult)
      setShowWinner(true)
      if (gameResult === "X" || gameResult === "O") {
        setScores((prev) => ({ ...prev, [gameResult]: prev[gameResult] + 1 }))
      } else {
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
      }
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
    }
  }

  // AI move effect
  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "O" && !winner) {
      setIsAiTurn(true)
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board])
        handleMove(bestMove)
        setIsAiTurn(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, board, gameMode, winner])

  const resetGame = () => {
    setBoard(Array(9).fill(""))
    setCurrentPlayer("X")
    setWinner(null)
    setWinningPattern([])
    setShowWinner(false)
    setIsAiTurn(false)
  }

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
    resetGame()
  }

  const startNewGame = (mode) => {
    setGameMode(mode)
    resetGame()
    resetScores()
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Player Profile */}
            {profile && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800">Welcome back!</h3>
                <p className="text-purple-600 font-medium">{profile.username}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="text-6xl mb-4">❌⭕</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">XO Game</h1>
              <p className="text-gray-600">Choose game mode</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => startNewGame("pvp")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 text-lg"
              >
                <User className="w-5 h-5 mr-2" />
                Player vs Player
              </Button>

              <Button
                onClick={() => startNewGame("ai")}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg"
              >
                <Bot className="w-5 h-5 mr-2" />
                Player vs AI
              </Button>
            </div>

            <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full mt-4">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setGameMode(null)} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">XO Game {gameMode === "ai" ? "(vs AI)" : "(PvP)"}</h1>
          <Button variant="ghost" onClick={resetScores} className="text-white hover:bg-white/20">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Player Info */}
        {profile && (
          <Card className="mb-4 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-gray-600">
                Playing as: <span className="font-semibold text-purple-600">{profile.username}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scoreboard */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold text-red-500">❌</div>
                <div className="text-sm text-gray-600">{gameMode === "ai" ? "You" : "Player 1"}</div>
                <div className="text-lg font-semibold">{scores.X}</div>
              </div>
              <div>
                <div className="text-lg text-gray-600">Draws</div>
                <div className="text-lg font-semibold">{scores.draws}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">⭕</div>
                <div className="text-sm text-gray-600">{gameMode === "ai" ? "AI" : "Player 2"}</div>
                <div className="text-lg font-semibold">{scores.O}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Player */}
        {!winner && (
          <motion.div
            className="text-center mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            <p className="text-white text-xl">
              {isAiTurn ? (
                <>AI is thinking... 🤖</>
              ) : (
                <>
                  Current Player: <span className="font-bold text-2xl">{currentPlayer === "X" ? "❌" : "⭕"}</span>
                  {gameMode === "ai" && currentPlayer === "O" && " (AI)"}
                </>
              )}
            </p>
          </motion.div>
        )}

        {/* Game Board */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {board.map((cell, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: cell ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMove(index)}
                  className={`
                    aspect-square bg-gray-50 rounded-xl text-5xl font-bold
                    flex items-center justify-center transition-all duration-200 shadow-md
                    ${winningPattern.includes(index) ? "bg-green-200 ring-4 ring-green-400 shadow-lg" : ""}
                    ${cell ? "cursor-default" : "hover:bg-gray-100 cursor-pointer hover:shadow-lg"}
                    ${isAiTurn ? "cursor-not-allowed" : ""}
                  `}
                  disabled={!!cell || !!winner || isAiTurn}
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: cell ? 1 : 0, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                  >
                    {cell === "X" ? "❌" : cell === "O" ? "⭕" : ""}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Play Again Button */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center space-y-3"
          >
            <Button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg rounded-full"
            >
              Play Again
            </Button>
            <Button variant="outline" onClick={() => setGameMode(null)} className="w-full">
              Change Mode
            </Button>
          </motion.div>
        )}
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
                {winner === "draw" ? (
                  <div className="text-6xl">🤝</div>
                ) : (
                  <div className="text-6xl">{winner === "X" ? "❌" : "⭕"}</div>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {winner === "draw"
                  ? "It's a Draw!"
                  : gameMode === "ai"
                    ? winner === "X"
                      ? "You Win!"
                      : "AI Wins!"
                    : `${winner} Wins!`}
              </h2>

              <div className="flex space-x-2 justify-center mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <Trophy className="w-6 h-6 text-yellow-500" />
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>

              <p className="text-gray-600 mb-6">
                {winner === "draw"
                  ? "Great game! Try again!"
                  : gameMode === "ai" && winner === "X"
                    ? "Congratulations! You beat the AI!"
                    : gameMode === "ai" && winner === "O"
                      ? "AI wins this round! Try again!"
                      : "Congratulations on your victory!"}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowWinner(false)
                    resetGame()
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  Play Again
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
