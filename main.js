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
    console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] CLIENT ${id} CONNECTED.`)
    let username = ""

    socket.on("name", data => {
        if (users.includes(data.message)) {
            socket.emit("name", "EXISTS")
            return
        }

        username = data.message
        users.push(data.message)
        socket.emit("name", "SUCCESS")
        io.emit("server", username + "님이 들어왔습니다.")
        console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] CLIENT ${id}: SET NAME = ${data.message}`)
    })
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
    socket.on("disconnect", () => {
        io.emit("server", username + "님이 나갔습니다.")
        console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] CLIENT DISCONNECTED. INFO:`, socket.request.connection._peername)
        users.splice(users.indexOf(username), 1)
    })
})