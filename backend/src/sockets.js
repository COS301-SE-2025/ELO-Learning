import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../database/supabaseClient.js'

const queue = []
const matchMap = new Map()

export default (io, socket) => {

    const queueForGame = () => {
        console.log("Queueing for game:", socket.id)
        if (!queue.includes(socket)) {
            queue.push(socket)
        }

        if (queue.length >= 2) {
            const player1 = queue.shift()
            const player2 = queue.shift()
            //Write to the database
            console.log("Starting game between:", player1.id, "and", player2.id)
            const gameId = uuidv4()
            player1.join(gameId)
            player2.join(gameId)
            io.to(player1.id).emit("startGame", gameId)
            io.to(player2.id).emit("startGame", gameId)
            matchMap.set(gameId, {
                players: [player1.id, player2.id],
                levels: [],
                playerReadyCount: 0,
            })
        }
    }

    const cancelQueue = () => {
        console.log("Cancelling queue for game:", socket.id)
        const index = queue.indexOf(socket)
        //This will potentially cause some issues. Consider integration with the db
        if (index !== -1) {
            queue.splice(index, 1)
            console.log("Cancelled queue for:", socket.id)
        } else {
            console.log("Socket not found in queue:", socket.id)
        }
    }

    const startMatch = async (gameId, level) => {
        const gameData = matchMap.get(gameId)
        if (!gameData) {
            console.log("Game not found:", gameId)
            return
        }

        // Update player ready count
        gameData.playerReadyCount += 1

        // Store user level data
        if (!gameData.levels.includes(level)) {
            gameData.levels.push(level)
        }

        // Update the matchMap with the modified data
        matchMap.set(gameId, gameData)

        if (gameData.playerReadyCount === 2) {
            console.log("Both players are ready for game:", gameId)

            try {
                // Calculate the average level from all players
                const averageLevel = Math.round(
                    gameData.levels.reduce((sum, level) => sum + level, 0) / gameData.levels.length
                )

                console.log(`Game ${gameId} - Player levels: ${gameData.levels}, Average level: ${averageLevel}`)

                // Fetch 15 random questions for the calculated average level
                const { data: questions, error: qError } = await supabase
                    .from('Questions')
                    .select('*')
                    .eq('level', averageLevel)

                if (qError) {
                    console.log("Database error:", qError)
                    io.to(gameId).emit("gameError", { error: 'Failed to fetch questions' })
                    return
                }

                if (!questions || questions.length === 0) {
                    io.to(gameId).emit("gameError", { error: `No questions found for level ${averageLevel}` })
                    return
                }

                // Shuffle and pick 15
                const shuffled = questions.sort(() => 0.5 - Math.random())
                const selected = shuffled.slice(0, 16)

                //fetch the answers for the above questions
                const questionIds = selected.map(q => q.Q_id)
                const { data: answers, error: aError } = await supabase
                    .from('Answers')
                    .select('*')
                    .in('question_id', questionIds)
                if (aError) {
                    console.log("Database error:", aError)
                    io.to(gameId).emit("gameError", { error: 'Failed to fetch answers' })
                    return
                }

                // Map answers to respective questions in the selected array
                selected.forEach(q => {
                    q.answers = answers.filter(a => a.question_id === q.Q_id).map(a => ({
                        id: a.answer_id,
                        text: a.answer_text,
                        isCorrect: a.isCorrect,
                    }))
                })

                // Map to clean structure
                // const cleanQuestions = selected.map((q) => ({
                //     id: q.Q_id,
                //     topic: q.topic,
                //     difficulty: q.difficulty,
                //     level: q.level,
                //     question: q.questionText,
                //     xpGain: q.xpGain,
                //     type: q.type,
                // }))

                // Emit the questions to both players
                io.to(gameId).emit("gameReady", {
                    gameId,
                    questions: selected,
                    matchLevel: averageLevel
                })

                // Clear the match after starting
                matchMap.delete(gameId)

            } catch (err) {
                console.log("Server error:", err)
                io.to(gameId).emit("gameError", { error: 'Server error' })
            }
        }
    }

    socket.on("queue", queueForGame)
    socket.on("cancelQueue", cancelQueue)
    socket.on("startMatch", (data) => startMatch(data.game, data.level))
}