import { FC, useState, useEffect, useRef } from 'react';

import './SocketApp.css';

import moment from 'moment';
import { MessageType } from './types';



interface IMessage {
    type: MessageType,
    date?: Date,
    username: string,
    message?: string
}

const RenderMessage = (props: any) => {
    // console.log({props});
    const data = props.data;

    let result = <div> ... </div>
    switch (data.type) {
        case MessageType.JOIN:
            result = <div className="small-message"> {data.username} has joined the chat. </div>
            break;
        case MessageType.LEAVE:
            result = <div className="small-message"> {data.username} has left the chat. </div>
            break;
        case MessageType.MESSAGE:
            result = <div>   
                <div className="username"> {data.username}: <span style={{ flex: 1 }}></span> <span className="date"> {data.date} </span> </div>
                <div className="message"> {data.message} </div>
            </div>
            break;
        case MessageType.ERROR:
            result = <div className="error">
                {data.message}
            </div>
            break;
    }
    return <div style={{ ...props.style }}> {result} </div>;
}

interface ISocketApp {
    username: string,
    onLeave: () => void,
    socket: any,
    isConnected: boolean
}

const SocketApp: FC<ISocketApp> = ({
    username,
    onLeave,
    socket,
    isConnected
}) => {
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState<IMessage[]>([]);
    const chatboxEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socket.on('chat join', (data: any) => {
            const newMessage: IMessage = {
                username: data.username,
                type: MessageType.JOIN,
            }

            setMessageList((messageList) => [
                ...messageList,
                newMessage
            ]);
        });

        socket.on('chat leave', (data: any) => {
            const newMessage: IMessage = {
                username: data.username,
                type: MessageType.LEAVE,
            }

            setMessageList((messageList) => [
                ...messageList,
                newMessage
            ]);
        });

        socket.on('chat message', (data: any) => {
            console.log("Got a message:", data);

            try {
                const newMessage: IMessage = {
                    username: data.username,
                    type: MessageType.MESSAGE,
                    date: data.date,
                    message: data.message
                }

                setMessageList((messageList) => [
                    ...messageList,
                    newMessage
                ]);
            } catch (e) {
                console.warn("WARNING: Unable to receive message: Invalid data!");
            }
        });
      
        return () => {
            socket.off('chat join');
            socket.off('chat leave');
            socket.off('chat message');
        };
    }, []);

    // scroll to the bottom after updating message list
    useEffect(() => {
        chatboxEndRef.current?.scrollIntoView({
            behavior: 'auto', // smooth
            // block: 'end',
            // inline: 'nearest'
        });
    }, [messageList]);

    const sendErrorMessage = (msg: string) => {
        const newMessage: IMessage = {
            username: username,
            type: MessageType.ERROR,
            message: msg
        }

        setMessageList((messageList) => [
            ...messageList,
            newMessage
        ]);
    }

    const handleSendMessage = () => {
        console.log(`Message: ${message}`);

        if (message.length > 0) {
            const date = moment().locale("ru").format("DD.MM.YYYY hh:mm");
            
            if (isConnected) {
                socket.emit('chat message', {username, type: MessageType.MESSAGE, date, message});
                setMessage("");
            } else {
                sendErrorMessage("UNABLE TO SEND MESSAGE! There is no connection with the server.");
            }
        }
    }

    const handleLeave = () => {
        if (onLeave) onLeave();
        if (isConnected) {
            socket.emit('chat leave', {username, type: MessageType.LEAVE});
        } else {
            sendErrorMessage("UNABLE TO SEND MESSAGE! There is no connection with the server.");
        }
    }

    return <div>
        <div style={{ display: "flex", marginBottom: 15 }}>
            <div> <span style={{ fontWeight: "bold" }}> Username: </span> { username } <span className={isConnected ? 'circle-green' : 'circle-red'}/>  </div>
            <div style={{ flex: 1 }}></div>
            <button onClick={() => handleLeave()}> Leave </button>
        </div>
        <div className="chatbox">
            { messageList.map((data, i) => <div key={i} className={`message-container ${!(i % 2) ? "odd" : ""}`}>
                <RenderMessage data={data} style={{ padding: 5 }} />
            </div>)}
            <div ref={chatboxEndRef}></div>
        </div>
        <div style={{ marginTop: 15 }} className="input-container">
            <input 
                placeholder='Leave a message' 
                style={{ flex: 1 }} value={message} maxLength={150} 
                onChange={(e) => setMessage(e.target.value) }
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSendMessage()
                    }
                }}
                />
            <button className='send-button' onClick={() => handleSendMessage()}> Send </button>
        </div>
    </div>
}

export default SocketApp;