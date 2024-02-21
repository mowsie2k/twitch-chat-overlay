// setup
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// serve static files from the 'public' directory
app.use(express.static("public"));
app.use("/fonts", express.static("fonts"));

// twitch irc setup
const tmi = require("tmi.js");
const options = {
  options: {
    debug: true,
  },
  connections: {
    secure: true,
    reconnect: true,
  },
  channels: ["mowsie2k"],
};

const client = new tmi.Client(options);
client.connect();

// create http server and bind it with express app
const http = require("http");
const server = http.createServer(app);

// socket.io setup
const { Server } = require("socket.io");
const io = new Server(server);
client.on("message", (channel, tags, message, self) => {
  if (self) return;
  const nameColor = tags.color || "#FFFFFF";
  io.emit("chat message", {
    name: tags["display-name"],
    message: message,
    color: nameColor,
  });
  console.log(`${tags["display-name"]}: ${message}`);
});

// serve index.html for root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// listen on provided port
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
