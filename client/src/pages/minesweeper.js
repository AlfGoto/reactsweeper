import React, { useState, useEffect } from 'react';
import '../App.css';
import io from 'socket.io-client'

function Minesweeper() {
    let width = 0

    useEffect(() => {
        const socket = io.connect('http://localhost:4000')



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

                square.addEventListener('click', () => {
                    if (square.innerHTML == '') {
                        socket.emit('click', i)
                    }
                })
            }
        })
        socket.on('squareClicked', msg => {
            let square = document.getElementById(msg.id)

            if (square.classList.contains('dark')) {
                square.classList.remove('dark')
                square.classList.add('openDark')
            } else {
                square.classList.remove('light')
                square.classList.add('openLight')
            }
            if (msg.data != 0) {
                square.innerHTML = msg.data
            } else {
                let i = msg.id
                let isLeftEdge = (i % width === 0)
                let isRightEdge = (i % width === width - 1)
                if (!isRightEdge && checkInnerHtmlNull(i + 1)) { socket.emit('click', i + 1) }
                if (!isLeftEdge && checkInnerHtmlNull(i - 1)) { socket.emit('click', i - 1) }
                if (!isRightEdge && checkInnerHtmlNull(i + 1 + width)) { socket.emit('click', i + 1 + width) }
                if (!isLeftEdge && checkInnerHtmlNull(i - 1 - width)) { socket.emit('click', i + 1 - width) }
                if (!isLeftEdge && checkInnerHtmlNull(i - 1 + width)) { socket.emit('click', i + 1 + width) }
                if (!isRightEdge && checkInnerHtmlNull(i + 1 - width)) { socket.emit('click', i + 1 - width) }
                if (checkInnerHtmlNull(i + width)) { socket.emit('click', i + width) }
                if (checkInnerHtmlNull(i - width)) { socket.emit('click', i - width) }
            }

        })

        let grid = document.getElementById('grid')
    }, [])

    function checkInnerHtmlNull(id) {
        if (document.getElementById(id) == null) { return false 
        }else{
            if (document.getElementById(id).innerHTML == '') { 
                return true 
            } else {
                return false
            }
        }
    }

    return (
        <div className="App">
            <div id="grid"></div>
        </div>
    );
}

export default Minesweeper;