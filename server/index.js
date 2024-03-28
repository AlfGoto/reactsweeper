const express = require('express')
const app = express()
const cors = require('cors')
const { cp } = require('fs')
app.use(cors())
app.use(express.json())

const width = 20

const server = app.listen(4000, () => {
    console.log('server is up & running')
})

io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

io.on('connection', (socket) => {
    console.log('Connected & socket Id is', socket.id)
    socket.emit('width', width)
    
    socket.grid = build()
    socket.firstClick = true
    
    socket.on('click', msg => { click(socket, msg) })
    socket.on('leftRightClick', e => { socket.emit('leftRightClickResponse', { id: e, data: socket.grid[e] }) })
    socket.on('bombExploded', ()=>{socket.emit('bombExploded', socket.grid)})
    socket.on('restart', ()=>{socket.grid = build(); socket.emit('width', width); socket.firstClick = true})
})


function build() {
    let grid = []
    let bombs = []
    bombs.push(...Array(70).fill('bomb'))
    let empties = []
    empties.push(...Array(width * width - 70).fill('empty'))
    grid.push(...bombs, ...empties)
    shuffleArray(grid)

    let data = []
    grid.forEach(e => {
        let i = grid.indexOf(e)
        let isLeftEdge = (i % width === 0)
        let isRightEdge = (i % width === width - 1)

        if (e != 'bomb') {
            let total = 0
            if (!isLeftEdge && dataCheckIfBomb(grid, i - 1)) { total++ }
            if (!isRightEdge && dataCheckIfBomb(grid, i + 1)) { total++ }
            if (!isLeftEdge && dataCheckIfBomb(grid, i - 1 + width)) { total++ }
            if (!isRightEdge && dataCheckIfBomb(grid, i + 1 - width)) { total++ }
            if (!isRightEdge && dataCheckIfBomb(grid, i + 1 + width)) { total++ }
            if (!isLeftEdge && dataCheckIfBomb(grid, i - 1 - width)) { total++ }
            if (dataCheckIfBomb(grid, i - width)) { total++ }
            if (dataCheckIfBomb(grid, i + width)) { total++ }
            grid[grid.indexOf(e)] = total
        }
    })
    return grid
}
function click(socket, id) {
    if (socket.firstClick && socket.grid[id] != 0) {
        socket.grid = build()
        click(socket, id)
    } else {
        socket.firstClick = false
        socket.emit('squareClicked', { id: id, data: socket.grid[id] })
    }
}
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function dataCheckIfBomb(arr, arg) {
    if (arr[arg] != null) { if (arr[arg] == 'bomb') { return true } else { return false } }
}

