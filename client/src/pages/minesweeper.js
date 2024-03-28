import React, { useState, useEffect } from 'react';
import '../App.css';
import io from 'socket.io-client'

function Minesweeper() {
    let width = 0

    useEffect(() => {
        const socket = io.connect('http://localhost:4000')
        socket.on('width', msg => { 
            width = msg 
            console.log(width)
            for(let i = 0; i< width*width; i++){
                let square = document.createElement('div')
                square.classList.add('square')
                document.getElementById('grid').appendChild(square)
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