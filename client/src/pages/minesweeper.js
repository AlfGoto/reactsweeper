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
                    socket.emit('click', i)
                })
            }
        })

        let grid = document.getElementById('grid')
    }, [])



    return (
        <div className="App">
            <div id="grid"></div>
        </div>
    );
}

export default Minesweeper;