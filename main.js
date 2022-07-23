const express = require("express"),
    http = require("http"),
    socketIO = require("socket.io"),
    dayjs = require("dayjs")

const app = express()
app.set("port", process.env.PORT || 5000)
app.use(express.static(__dirname))

const server = http.createServer(app).listen(app.get("port"), () => {
    console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] SERVER STARTED. PORT: ${app.get("port")}`)
})

const io = socketIO(server)
console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] WAITING FOR CONNECTION...`)

const users = []

io.on("connection", socket => {
    let id = users.length
    let username = ""
    
    console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] CLIENT ${id} CONNECTED.`)

    // 사용자명 중복검사
    socket.on("name", data => {
        if (users.includes(data.message)) {
            socket.emit("name", "EXISTS")
            return
        }

        username = data.message
        users.push(data.message)

        socket.emit("name", "SUCCESS")
        io.emit("server", {
            online: users.length,
            message: username + "님이 들어왔습니다."
        })

        console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] CLIENT ${id}: SET NAME = ${data.message}`)
    })
    // 채팅
    socket.on("chatting", data => {
        const {
            name,
            message
        } = data
        io.emit("chatting", {
            name,
            message,
            time: dayjs().format("A h:mm")
        })
    })
    // 접속 해제
    socket.on("disconnect", () => {
        users.splice(users.indexOf(username), 1)
        io.emit("server", {
            online: users.length,
            message: username + "님이 나갔습니다."
        })

        console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] CLIENT DISCONNECTED. INFO:`, socket.request.connection._peername)
    })
})