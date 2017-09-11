const express = require('express')
const app = express()
const path = require('path')
require('dotenv').load()

/* DANGEROUS This disables HTTPS / SSL / TLS checking across your entire node.js environment. */
const NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED

const APIAI_TOKEN = process.env.APIAI_TOKEN
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID
const PORT = process.env.PORT

const view = path.join(__dirname, '/views')
const client = path.join(__dirname, '/client')

app.use(express.static(view))
app.use(express.static(client))

const server = app.listen(PORT)

const io = require('socket.io')(server)
io.on('connection', socket => console.log('a user connected'))

const apiai = require('apiai')(APIAI_TOKEN)

app.get('/', (req, res) => res.sendFile('index.html'))

io.on('connection', (socket) => {
  socket.on('chat message', (text) => {
    console.log('Message: ' + text)

    let apiaiReq = apiai.textRequest(text, {
      sessionId: APIAI_SESSION_ID
    })

    apiaiReq.on('response', (response) => {
      let aiText = response.result.fulfillment.speech
      console.log('Bot reply: ' + aiText)
      socket.emit('bot reply', aiText)
    })

    apiaiReq.on('error', error => console.log(error))

    apiaiReq.end()
  })
})
