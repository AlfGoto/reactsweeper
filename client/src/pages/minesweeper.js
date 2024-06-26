import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'

const Minesweeper = () => {
    const [time, setTime] = useState(0)
    let width = 0
    let isGameOver = false

    var socket;
    var timer;

    useEffect(() => {
        timer = new timerClass()
        socket = io.connect('http://localhost:4000')



        socket.on('width', msg => {
            timer.stop()
            isGameOver = false
            width = msg
            timer.reset()
            build()
        })
        socket.on('squareClicked', msg => {
            let square = document.getElementById(msg.id)
            square.innerHTML = ''

            if (msg.data === 'bomb') {
                timer.stop()
                square.innerHTML = "<img class='bomb' src='image/bomb.png'/>"
                isGameOver = true
                socket.emit('bombExploded')
            } else {
                if (square.classList.contains('dark')) {
                    square.classList.remove('dark')
                    square.classList.add('openDark')
                } else if (square.classList.contains('light')) {
                    square.classList.remove('light')
                    square.classList.add('openLight')
                }
                if (msg.data !== 0) {
                    square.innerHTML = msg.data
                } else if (msg.data !== 'bomb') {
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
            }

            if (!timer.counting) timer.start()
        })

        socket.on('leftRightClickResponse', msg => { leftRightClick(msg.id, msg.data) })

        socket.on('bombExploded', (data) => {
            let temp = []
            for (let i = 0; i < data.length; i++) {
                if (data[i] === 'bomb') temp.push(i)
            }
            shuffleArray(temp)
            temp.forEach(e => {
                setTimeout(() => {
                    if (isGameOver) document.getElementById(e).innerHTML = "<img class='bomb' src='image/bomb.png'/>"
                }, Math.ceil(Math.random() * 10000))
            })
            setTimeout(() => { if (isGameOver) document.getElementById('loseInterface').style.display = 'block' }, 4000)
        })
        socket.on('win', () => { win() })
    }, [])

    function build() {
        isGameOver = false
        document.getElementById('grid').innerHTML = ''
        for (let i = 0; i < width * width; i++) {
            let square = document.createElement('div')
            square.classList.add('square')
            square.id = i
            document.getElementById('grid').appendChild(square)

            if (Math.ceil(i + 1 / width) % 2 === 0) {
                // square.classList.add(Math.ceil(i/width))
                if (Math.ceil(i / width) % 2 == 0) {
                    square.classList.add('dark')
                } else {
                    square.classList.add('light')
                }
            } else {
                if (i % width === 0) {
                    square.classList.add(Math.ceil(i / width))
                    if (Math.ceil(i / width) % 2 === 0) {
                        square.classList.add('dark')
                    } else {
                        square.classList.add('light')
                    }
                } else {
                    square.classList.add(Math.ceil(i / width))
                    if (Math.ceil(i / width) % 2 === 0) {
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
                if (isGameOver) { return }

                if (e.button == 0) {
                    leftClick = true
                    if (square.innerHTML === '') { socket.emit('click', i) }
                }
                if (e.button === 2) {
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
                        }
                    }
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
    }
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
            if (totalFlags === data) {
                if (isLeftEdge && isGameOver === false) {
                    click(i + 1 - width)
                    click(i - width)
                    click(i + 1)
                    click(i + 1 + width)
                    click(i + width)
                } else if (isRightEdge && isGameOver === false) {
                    click(i - 1)
                    click(i - width)
                    click(i - 1 - width)
                    click(i - 1 + width)
                    click(i + width)
                } else if (i < 20 && isGameOver === false) {
                    click(i - 1)
                    click(i + 1)
                    click(i - 1 + width)
                    click(i + 1 + width)
                    click(i + width)
                } else if (i < 400 && i > 379 && isGameOver === false) {
                    click(i - 1)
                    click(i + 1 - width)
                    click(i - width)
                    click(i - 1 - width)
                    click(i + 1)
                } else if (i === 0 && isGameOver === false) {
                    click(i + 1)
                    click(i + 1 + width)
                    click(i + width)
                } else {
                    if (isGameOver === false) {
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
        if (!document.getElementById(id).classList.contains('flag')
            && !document.getElementById(id).classList.contains('openDark')
            && !document.getElementById(id).classList.contains('openLight')) {
            socket.emit('click', id)
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
    function win() {
        timer.stop()
        isGameOver = true
        let arr = Array.from(document.getElementsByClassName('square'))
        shuffleArray(arr)
        console.log(arr)
        arr.forEach(e => {
            setTimeout(() => {
                if (!isGameOver) return
                e.innerHTML = ''
                if (e.classList.contains('openLight')) {
                    e.classList.remove('openLight')
                    e.classList.add('light')
                }
                if (e.classList.contains('openDark')) {
                    e.classList.remove('openDark')
                    e.classList.add('dark')
                }
            }, Math.ceil(Math.random() * 10000))
        })
        setTimeout(() => { if (isGameOver) document.getElementById('winInterface').style.display = 'block' }, 4000)
    }
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    class timerClass {
        constructor() {
            this.counting = false
        }
        intervalFunction() {
            setTime(time => time + 1)
        }
        start() {
            this.interval = setInterval(this.intervalFunction, 1000)
            this.counting = true
        }
        stop() {
            clearInterval(this.interval)
            this.counting = false
        }
        reset(){
            setTime(0)
        }
    }



    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('restartButton').addEventListener('click', () => {
            socket.emit('restart')
        })
    })

    return (
        <div>
            <div id='winInterface' className='winlostinterface'>
                <p>You Won !</p>
                <p>{time}</p>
            </div>
            <div id='loseInterface' className='winlostinterface'>
                <p>You Lost !</p>
            </div>
            <div id="timer">
                <p>{time}</p>
            </div>
            <div id="grid">
            </div>
        </div>
    );
}

export default Minesweeper;