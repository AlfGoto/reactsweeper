const express = require('express')
const app = express()
const cors = require('cors')
const { cp } = require('fs')
app.use(cors())
app.use(express.json())

const server = app.listen(4000, () => {
    console.log('server is up & running')
})

io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

io.on('connection', (socket)=>{
    console.log('Connected & socket Id is', socket.id)
    socket.emit('msg', 'WebSocket connected')
    socket.on('click', msg=>{console.log(msg)})
})