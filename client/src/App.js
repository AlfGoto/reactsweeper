import './App.css';
import io from 'socket.io-client'

function App() {

    const socket = io.connect('http://localhost:4000')
    socket.on('msg', msg=>{console.log(msg)})

    // socket.emit('click', 'ya un click')




  return (
    <div className="App">Hello World</div>
  );
}

export default App;
