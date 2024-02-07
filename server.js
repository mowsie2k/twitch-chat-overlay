const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Twitch IRC setup
const tmi = require('tmi.js');
const options = {
    options: {
        debug: true
    },
    connections: {
        secure: true,
        reconnect: true
    },
    channels: ['mowsie2k']
};
const client = new tmi.Client(options);
client.connect();
client.on('message', (channel, tags, message, self) => {
    if(self) return;
    console.log(`${tags['display-name']}: ${message}`)
});

// Create HTTP server and bind it with Express app
const http = require('http');
const server = http.createServer(app);

// Socket.IO setup
const { Server } = require('socket.io');
const io = new Server(server);
client.on('message', (channel, tags, message, self) => {
    if(self) return;
    const nameColor = tags.color || "#FFFFFF";
    io.emit('chat message', { name: tags['display-name'], message: message, color: nameColor });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Listen on provided port
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
