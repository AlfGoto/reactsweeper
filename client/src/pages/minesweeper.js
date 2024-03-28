import React, { useState, useEffect } from 'react';
import '../App.css';
import io from 'socket.io-client'

function Minesweeper() {
    let width = 0
    let isGameOver = false

    var socket;
    useEffect(() => {
        socket = io.connect('http://localhost:4000')



        socket.on('width', msg => {
            document.getElementById('grid').innerHTML = ''
            width = msg
            for (let i = 0; i < width * width; i++) {
                let square = document.createElement('div')
                square.classList.add('square')
                square.id = i
                document.getElementById('grid').appendChild(square)

                if (Math.ceil(i + 1 / width) % 2 == 0) {
                    // square.classList.add(Math.ceil(i/width))
                    if (Math.ceil(i / width) % 2 == 0) {
                        square.classList.add('dark')
                    } else {
                        square.classList.add('light')
                    }
                } else {
                    if (i % width == 0) {
                        square.classList.add(Math.ceil(i / width))
                        if (Math.ceil(i / width) % 2 == 0) {
                            square.classList.add('dark')
                        } else {
                            square.classList.add('light')
                        }
                    } else {
                        square.classList.add(Math.ceil(i / width))
                        if (Math.ceil(i / width) % 2 == 0) {
                            square.classList.add('light')
                        } else {
                            square.classList.add('dark')
                        }
                    }
                }
                square.oncontextmenu = function (e) {
                    e.preventDefault()
                }
                let rightClick = false
                let leftClick = false
                square.addEventListener('mousedown', e => {

                    if (e.button == 0) {
                        leftClick = true
                        if (square.innerHTML == '') { socket.emit('click', i) }
                    }
                    if (e.button == 2) {
                        rightClick = true
                        if (!square.classList.contains('openLight') && !square.classList.contains('openDark')) {
                        if (square.classList.contains('flag')) {
                            setTimeout(() => {
                                square.classList.remove('flag')
                                square.innerHTML = ''
                            }, 10)
                        } else {
                            square.classList.add('flag')
                            square.innerHTML = '<img class="imgFlag" src="image/flag.png"/>'
                        }}
                    }
                    if (leftClick && rightClick) {
                        socket.emit('leftRightClick', i)
                        // lightLeftRightClick(i, square)
                    }
                })
                square.addEventListener('mouseup', g => {
                    setTimeout(() => {
                        if (g.button === 2) { rightClick = false }
                        if (g.button === 0) { leftClick = false }
                    }, 100)
                    // if ((leftClick == false) && (rightClick == false) && (lightOn == true)) {lightLeftRightClickOFF()}
                })

            }
        })
        socket.on('squareClicked', msg => {
            let square = document.getElementById(msg.id)
            square.innerHTML = ''

            if (square.classList.contains('dark')) {
                square.classList.remove('dark')
                square.classList.add('openDark')
            } else if (square.classList.contains('light')) {
                square.classList.remove('light')
                square.classList.add('openLight')
            }
            if (msg.data != 0) {
                square.innerHTML = msg.data
            } else {
                //click sur les carrés a coté
                let i = msg.id
                let isLeftEdge = (i % width === 0)
                let isRightEdge = (i % width === width - 1)
                if (!isRightEdge && checkIfClickable(i + 1)) { socket.emit('click', i + 1) }
                if (!isLeftEdge && checkIfClickable(i - 1)) { socket.emit('click', i - 1) }
                if (!isRightEdge && checkIfClickable(i + 1 + width)) { socket.emit('click', i + 1 + width) }
                if (!isLeftEdge && checkIfClickable(i - 1 - width)) { socket.emit('click', i - 1 - width) }
                if (!isLeftEdge && checkIfClickable(i - 1 + width)) { socket.emit('click', i - 1 + width) }
                if (!isRightEdge && checkIfClickable(i + 1 - width)) { socket.emit('click', i + 1 - width) }
                if (checkIfClickable(i + width)) { socket.emit('click', i + width) }
                if (checkIfClickable(i - width)) { socket.emit('click', i - width) }
            }
        })
        socket.on('leftRightClickResponse', msg => {
            leftRightClick(msg.id, msg.data)
        })

        let grid = document.getElementById('grid')
    }, [])

    function checkIfClickable(id) {
        if (document.getElementById(id) == null) {
            return false
        } else {
            if (document.getElementById(id).classList.contains('openDark') || document.getElementById(id).classList.contains('openLight')) {
                return false
            } else {
                return true
            }
        }
    }
    function leftRightClick(i, data) {
        let totalFlags = 0
        const isLeftEdge = (i % width === 0)
        const isRightEdge = (i % width === width - 1)
        if (data > 0) {
            if (i > 0 && !isLeftEdge && document.getElementById(i - 1).classList.contains('flag')) totalFlags++
            if (i > 19 && !isRightEdge && document.getElementById(i + 1 - width).classList.contains('flag')) totalFlags++
            if (i > 20 && document.getElementById(i - width).classList.contains('flag')) totalFlags++
            if (i > 21 && !isLeftEdge && document.getElementById(i - 1 - width).classList.contains('flag')) totalFlags++
            if (i < 398 && !isRightEdge && document.getElementById(i + 1).classList.contains('flag')) totalFlags++
            if (i < 380 && !isLeftEdge && document.getElementById(i - 1 + width).classList.contains('flag')) totalFlags++
            if (i < 378 && !isRightEdge && document.getElementById(i + 1 + width).classList.contains('flag')) totalFlags++
            if (i < 379 && document.getElementById(i + width).classList.contains('flag')) totalFlags++
            if (i === 398 && document.getElementById(i + 1).classList.contains('flag')) totalFlags++
            if (i === 379 && document.getElementById(i + 20).classList.contains('flag')) totalFlags++
            if (i === 378 && document.getElementById(i + 21).classList.contains('flag')) totalFlags++
            if (totalFlags == data) {
                if (isLeftEdge && isGameOver == false) {
                    click(i + 1 - width)
                    click(i - width)
                    click(i + 1)
                    click(i + 1 + width)
                    click(i + width)
                } else if (isRightEdge && isGameOver == false) {
                    click(i - 1)
                    click(i - width)
                    click(i - 1 - width)
                    click(i - 1 + width)
                    click(i + width)
                } else if (i < 20 && isGameOver == false) {
                    click(i - 1)
                    click(i + 1)
                    click(i - 1 + width)
                    click(i + 1 + width)
                    click(i + width)
                } else if (i < 400 && i > 379 && isGameOver == false) {
                    click(i - 1)
                    click(i + 1 - width)
                    click(i - width)
                    click(i - 1 - width)
                    click(i + 1)
                } else if (i == 0 && isGameOver == false) {
                    click(i + 1)
                    click(i + 1 + width)
                    click(i + width)
                } else {
                    if (isGameOver == false) {
                        click(i - 1)
                        click(i + 1 - width)
                        click(i - width)
                        click(i - 1 - width)
                        click(i + 1)
                        click(i - 1 + width)
                        click(i + 1 + width)
                        click(i + width)
                    }
                }

            }
        }
    }
    function click(id) {
        if (!document.getElementById(id).classList.contains('flag')) socket.emit('click', id)
    }

    return (
        <div className="App">
            <div id="grid"></div>
        </div>
    );
}

export default Minesweeper;