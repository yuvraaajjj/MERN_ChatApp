const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {handleRegister,handleLoggedIn,handleLogIn} = require("./controllers/login&register")
const ws = require("ws")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv");
const Message = require("./models/Message");
const User = require("./models/User")
const { handleOfflinePeople } = require("./controllers/chat");
const {GoogleGenerativeAI} =  require("@google/generative-ai");

dotenv.config();

const jwtsecret = process.env.JWT_SECRET;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Database Connected");
});

const app = express();
//#region update port number for server 
const PORT = process.env.PORT || 8000;
//#endregion

app.use(express.json());
app.use(cookieParser()); 

app.use(cors({
    credentials: true,
    origin: "https://mern-chatapp-frontend-skjl.onrender.com
}));

async function getUserData(req) {
    return new Promise((resolve, reject) => {
        const {token} = req.cookies
        if(token){
            jwt.verify(token, jwtsecret, {}, (err, userData) => {
                if(err) throw err
                resolve(userData)
            })
        }else{
            reject.status(401).json("no token")
        }
    }) 
}

async function getAiResponse(userMessage){
    try{
        const model = genAI.getGenerativeModel(
            { 
            
                model: "gemini-1.5-flash",
                systemInstruction: 
                    `You are a fun, friendly, and engaging AI chatbot designed for casual conversations. 
                    Your goal is to chat naturally, just like a human friend. You should:

                    - Use modern slang, emojis, and a chill, conversational tone.
                    - Keep responses lighthearted, engaging, and entertaining.
                    - Adapt to the user's vibe—be playful if they’re joking, and supportive if they need advice.
                    - Avoid deep technical, political, or controversial discussions—just keep it casual and fun.
                    - Use short and snappy responses when appropriate, but expand if the user wants to chat more.
                    - Keep up with modern trends, pop culture, and internet humor.
                    - Ask follow-up questions to keep the conversation flowing naturally.

                    Your name is Kiba and when the user says Hello or Hi your first response should be:
                    - Hi I am Kiba. How u doin!!!!
                    
                    Your main job is to make chatting feel effortless, enjoyable, and relatable—just like talking to a cool friend!`,
         });

        const result = await model.generateContent({
            contents: [
                {
                role: 'user',
                parts: [
                    {
                    text: userMessage,
                    }
                ],
                }
            ],
            generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.1,
            }
});
    
        return result.response.text()
    }catch(error){
        console.error("Error getting AI response: ",error)
        return "Sorry, I'm having trouble."
    }
}

app.get("/test", (req, res) => {
    res.json("Ok test");
});

app.post("/register", handleRegister);

app.get("/profile",handleLoggedIn)

app.post("/login", handleLogIn);

app.get('/ai-bot-id', async (req, res) => {
    try {
      const aiBot = await User.findOne({ username: "AI Assistant" });
      if (aiBot) {
        res.json({ id: aiBot._id });
      } else {
        res.status(404).json({ error: "AI bot not found" });
      }
    } catch (error) {
      console.error("Error fetching AI bot:", error);
      res.status(500).json({ error: "Server error" });
    }
});

app.get('/messages/:userId',async (req, res) => {
    const {userId} = req.params
    const userData = await getUserData(req)
    const ourUserId = userData.userID

    if(userId == "ai-bot"){
        try{

            const messages = await Message.find({
                $or: [
                    {sender: ourUserId, recipient: "ai-bot"},
                    {sender: "ai-bot", recipient: ourUserId}
                ]
            }).sort({createdAt: 1}).exec()

            res.json(messages)
        }catch(error){
            console.error("Error getting AI messages:", error);
            res.status(500).json({ error: "Failed to retrieve AI messages" });
        }

        return
    }

    const messages = await Message.find({
        sender:{$in:[userId,ourUserId]},
        recipient: {$in:[userId,ourUserId]},
    }).sort({createdAt:1}).exec()
    res.json(messages)
    
})

app.post('/logout',(req, res) => {
    res.cookie('token','',{samesite: 'none', secure: true}).json('ok')
})

app.get('/people', handleOfflinePeople)


const server = app.listen(PORT, () => {
    console.log(`Server started at Port-${PORT}`);
});


//WEBSOCKETS SERVER
const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {


    function notifyAboutOnlinePeople(){
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wss.clients].map(c => ({
                    userID: c.userID || null, 
                    username: c.username
                }))
            }));
        });
    }

    connection.isALive = true
        connection.timer = setInterval(() => {
            connection.ping()
            
            connection.deathTimer = setTimeout(() => {
                connection.isALive = false
                connection.terminate()
                notifyAboutOnlinePeople()
            },1000)
        }, 5000)

        connection.on('pong',() => {
            clearTimeout(connection.deathTimer)
        })

    // read username and id from the cookie for this connection
    const cookies = req.headers.cookie;

    if (cookies) {
        const tokenCookieString = cookies.split(";").find(str => str.trim().startsWith("token="));

        if (tokenCookieString) {
            const token = tokenCookieString.split("=")[1];

            if (token) {
                jwt.verify(token, jwtsecret, {}, (err, userData) => {
                    if (err) {
                        console.error("JWT Verification Error:", err);
                    } else {
                        const userID = userData.userID || userData.userId;  // Handle both cases
                        const { username } = userData;
                        connection.userID = userID
                        connection.username = username
                    }
                });
            }
        }
    }

    connection.on("message", async (message) => {

        const messageData = JSON.parse(message.toString())
        const {recipient, text} = messageData

        if (recipient === "ai-bot") {

            const aiBot = await User.findOne({username: "AI Assistant"})
            const aiBotId = aiBot ? aiBot._id : "ai-Bot" 


            // Store the user's message to AI bot
            const userMessageDoc = await Message.create({
                sender: connection.userID,
                recipient: aiBotId,
                text: text
            });

            // Get response from AI
            const aiResponse = await getAiResponse(text, connection.username);
            
            // Short delay to simulate thinking (optional)
            setTimeout(async () => {
                // Store AI's response
                const aiDoc = await Message.create({
                    sender: aiBotId,
                    recipient: connection.userID,
                    text: aiResponse
                });

                // Send the AI response back to the user
                connection.send(JSON.stringify({
                    text: aiResponse,
                    sender: "ai-bot",
                    _id: aiDoc._id,
                    recipient: connection.userID 
                }));
            }, 1000);
        } else if (recipient && text) {
            const messageDoc = await Message.create({
                sender: connection.userID,
                recipient,
                text
            });
            
            [...wss.clients]
            .filter(c => c.userID === recipient)
            .forEach(c => c.send(JSON.stringify({
                text,
                sender: connection.userID,
                _id: messageDoc._id,
                recipient: recipient
            })));
        }
    });

    // Notify everyone about connected users           
    notifyAboutOnlinePeople();
});



