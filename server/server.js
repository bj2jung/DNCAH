const express = require('express')
const app = express()
const http = require('http')
require('dotenv').config();

const server = http.createServer(app)

const db = require('./db/conn');

const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ENABLED_SITE,
        methods: ["GET", "POST"]
      }
})

const {v4: uuidv4} = require('uuid')

var cors = require('cors')

app.use(cors())

app.get('/connection', (req,res) => {
    res.json(uuidv4())
})

app.use('/cards', require('./routes/cards'))

io.on('connection', (socket => {

    socket.on('join-room', (roomId, userId, nickname) => {

        socket.join(roomId)

        socket.to(roomId).emit('someone-joined-room', userId, socket.id, nickname)
        
        socket.on('changeNickname', (userId, nickname) => {
            socket.to(roomId).emit('someone-changed-nickname', userId, nickname)
        })

        socket.on('updatePointsToWin', (points) => {
            socket.to(roomId).emit('points-to-win-updated', points)
        })

        socket.on('updateWaitTime', (seconds) => {
            socket.to(roomId).emit('wait-time-updated', seconds)
        })

        socket.on('roomFull', (playerId) => {
            socket.to(roomId).emit('room-full', playerId)
        })

        socket.on('disconnect', () => {
            socket.to(roomId).emit('someone-disconnected', userId)
        })

        socket.on('updateSelectedPack', (pack) => {
            socket.to(roomId).emit('selected-pack-updated', pack)
        })
    })
}))

db.connectToServer(err => {
    if (err) {
        console.error(err);
        process.exit();
    }

    server.listen(3000, () => console.log('server running'))
}) 
