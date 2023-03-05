import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';
import { MessageType } from './types';

import SocketApp from './SocketApp';
const host = "http://localhost:3000";
import io from 'socket.io-client';
const socket = io(host, {
    withCredentials: true,
    transports: ['websocket'] // ! enable CORS for ws
});

function App() {
	const [count, setCount] = useState(0);
	const [username, setUsername] = useState("");
	const [isEntered, setIsEntered] = useState(false);
	const [isConnected, setIsConnected] = useState(socket.connected);

	useEffect(() => {
		socket.on('connect', () => {
            console.log("Connection:");
            setIsConnected(true);
        });

		socket.on('disconnect', () => {
            setIsConnected(false);
        });

		return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
	}, []);

	const handleEnter = () => {
		setIsEntered(true);
		socket.emit('chat join', {username: username.length == 0 ? "Anon" : username, type: MessageType.JOIN});
	}

	return (
		<div className="App">
			{ !isEntered ? <div>
				<div>
					<a href="https://vitejs.dev" target="_blank">
						<img src="/vite.svg" className="logo" alt="Vite logo" />
					</a>
					<a href="https://reactjs.org" target="_blank">
						<img src={reactLogo} className="logo react" alt="React logo" />
					</a>
					<a href="https://socket.io/" target="_blank">
						<img src="/socketio.svg" className="logo socket.io" alt="Socket.io logo" style={{ filter: "drop-shadow(-1px -1px 0px black) drop-shadow(2px -1px 0px black) drop-shadow(2px 2px 0px black) drop-shadow(-1px 2px 0px black)" }} />
					</a>
				</div>
				<h1>Vite + React + Socket.io</h1>
				<div className="card">
					<button onClick={() => setCount((count) => count + 1)}>
						count is {count}
					</button>
					<input type="text" placeholder='Enter your name' value={username}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleEnter();
							}
						}}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<button onClick={() => handleEnter()}>
						Enter
					</button>
					<p>
						Edit <code>src/App.tsx</code> and save to test HMR
					</p>
				</div>
				<p className="read-the-docs">
					Click on a logo to learn more.
				</p>
			</div> : <div>
				<SocketApp
					socket={socket}
					isConnected={isConnected}
					username={username.length == 0 ? "Anon" : username}
					onLeave={() => {
						setIsEntered(false);
					}}
				/>
			</div> }
		</div> 
	)
}

export default App;
