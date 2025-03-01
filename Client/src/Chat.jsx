import { useContext, useEffect, useState, useRef } from "react"
import Logo from "./logo"
import { UserContext } from "./UserContext"
import {uniqBy} from "lodash"
import axios from "axios"
import Person from "./Person"

export default function Chat(){
    const [wsConnect, setWSConnect] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUser, setSelectedUser] = useState(null)
    const {username, id,setId,setUsername} = useContext(UserContext)
    const [newMessageText, setNewMessageText] = useState("")
    const [messages, setMessages] = useState([])
    const divUnderMessages = useRef()
    const [offlinePeople, setOfflinePeople] = useState({})
    const [isOpen, setIsOpen] = useState(false);
    const [aiTyping, setAiTyping] = useState(false)
    const [aiBot, setAiBot] = useState({ id: "ai-bot", username: "AI Assistant" });

    useEffect(()=>{
        connect()
    },[])

    function connect(){
        const ws = new WebSocket('wss://mern-chatapp-backend-k8vl.onrender.com')
        setWSConnect(ws)
        ws.addEventListener("message", handleMessage)
        ws.addEventListener("close",() => {
            setTimeout(() => {
                console.log("disconnected")
                connect()
            }, 1000)
        })
    }

    function showOnlinePeople(peopleArray){
        const people = {}
        peopleArray.forEach(({userID,username}) => {
            people[userID] = username
        });
        setOnlinePeople(people)
    }

    function handleMessage(e){
        const messageData = JSON.parse(e.data)
        if("online" in  messageData){
            showOnlinePeople(messageData.online)
        }else if("text" in messageData){
            if(messageData.sender === "ai-bot")
                setAiTyping(false)
            setMessages(prev => ([...prev,
                {...messageData}
            ]))
        }
    }

    function sendMessage(e){
        e.preventDefault()
        const isAiBotSelected = selectedUser === aiBot.id

        wsConnect.send(JSON.stringify({
            recipient: isAiBotSelected ? "ai-bot" : selectedUser,
            text: newMessageText,
        }))
        setMessages(prev => ([...prev,{
            text: newMessageText,
            sender: id,
            recipient: selectedUser,
            _id: Date.now()
        }]))

        if(isAiBotSelected)
            setAiTyping(true)
        
        setNewMessageText("")
    }

    function logout(){
        axios.post('/logout').then(() => {
            setWSConnect(null)
            setId(null)
            setUsername(null)
        })
    }

    useEffect(() => {
        if (divUnderMessages.current) {
            divUnderMessages.current.scrollIntoView({ 
                behavior: "smooth",
                block: 'end'
             });
        }
    }, [messages]);

    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArray = res.data
            .filter(p => p._id !== id)
            .filter(p => !Object.keys(onlinePeople).includes(p._id))
            .filter(p => p.username !== "AI Assistant") // Filter out offline AI Assistant
            const offlinePeople = {}
            offlinePeopleArray.forEach(p => {
                offlinePeople[p._id] = p
            })
            setOfflinePeople(offlinePeople)
        })
    },[onlinePeople])

    useEffect(() => {
        if(selectedUser){
            axios.get(`/messages/${selectedUser}`).then(res => {
                setMessages(res.data)
            })
        }
    },[selectedUser])

    // No need to fetch AI bot ID from server since we're using a fixed ID
    
    const onlinePeopleExcludingUser = {...onlinePeople}
    delete onlinePeopleExcludingUser[id]

    const messageWithoutDupes = uniqBy(messages, '_id');       

    return(
        <div className="flex flex-col relative h-screen bg-white">
            <div className="bg-white flex absolute top-0 left-0 w-full justify-between">
                <div>
                    <Logo/>
                </div>
                <div className="relative text-white flex my-1 mr-1">

                <div className="text-black flex m-2 relative">
                    <button
                    className="cursor-pointer focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                    </svg>
                    </button>
                </div>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-10">
                    <span className="flex justify-end cursor-pointer p-2">
                    <button onClick={() => setIsOpen(false)} className="text-black cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>   
                    </span>     
                    <button onClick={() => setIsOpen(false)} className="block w-full text-left p-2 hover:bg-gray-200 text-sm">
                        {username}
                    </button>
                    <button
                        onClick={logout}
                        className="block w-full text-left p-2 text-red-600 hover:bg-gray-200 text-sm"
                    >
                        Logout
                    </button>
                    </div>
                )}
                </div>
            </div>
            <div className="flex flex-grow rounded-l-lg pt-10">
                <div className="bg-[#F8F3D9] w-64">
                    
                    {/* This is the AI Assistant at the top that you want to use */}
                    <Person 
                        key="ai-bot-top"
                        id={aiBot.id}
                        online={true}
                        username="AI Assistant"
                        onClick={() => setSelectedUser(aiBot.id)}
                        selected={aiBot.id === selectedUser}
                    />

                    <div className="border-b border-gray-300 my-2"></div>

                    {Object.keys(onlinePeopleExcludingUser).map(userID => (
                        <Person
                        key={userID} 
                        id={userID}
                        online={true} 
                        username={onlinePeopleExcludingUser[userID]}
                        onClick={() => setSelectedUser(userID)}
                        selected={userID === selectedUser}
                        />
                    ))}
                    {Object.keys(offlinePeople).map(userID => (
                        <Person
                        key={userID} 
                        id={userID}
                        online={false} 
                        username={offlinePeople[userID].username}
                        onClick={() => setSelectedUser(userID)}
                        selected={userID === selectedUser}
                        />
                    ))}
            </div>

            <div className="flex flex-col bg-[#3F4F44] w-full p-2">
                    <div className="flex-grow">
                        {!selectedUser && (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-black">
                                    No selected Person
                                </div>
                            </div>
                        )}
                        {!!selectedUser && (
                            <div className="relative h-full">
                                <div className="overflow-auto absolute top-0 left-0 right-0 bottom-2">
                                    {messageWithoutDupes.map(message => (
                                        <div key={message._id} className={(message.sender === id ? 'text-right mx-2' : 'text-left mx-2')}>
                                            <div className={"text-left inline-block p-2 my-2 rounded-md "
                                            +(message.sender === id ?
                                            'bg-[#B59F78] text-gray-700' : 
                                            message.sender === "ai-bot" || message.sender === aiBot.id ? 
                                            'bg-[#76885B] text-white' :
                                            'bg-[#76885B] text-gray-800')}>
                                                {message.text}
                                            </div>
                                        </div>
                                    ))}
                                    {aiTyping && selectedUser === aiBot.id && (
                                        <div className="text-left mx-2">
                                            <div className="text-left inline-block p-2 my-2 rounded-md bg-[#76885B] text-white">
                                                <div className="flex items-center">
                                                    <div className="h-2 w-2 bg-white rounded-full animate-pulse mr-1"></div>
                                                    <div className="h-2 w-2 bg-white rounded-full animate-pulse delay-75 mr-1"></div>
                                                    <div className="h-2 w-2 bg-white rounded-full animate-pulse delay-150"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={divUnderMessages}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        {!!selectedUser && (
                            <form className="flex gap-2" onSubmit={sendMessage}>
                                <input type="text" 
                                value={newMessageText}
                                onChange={e => setNewMessageText(e.target.value)}
                                className="bg-white flex-grow rounded-sm p-1" 
                                placeholder="Type Your message..." />
            
                                <button type="submit" className="bg-[#EBE5C2] rounded-sm p-2 text-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                    </svg>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}