var express = require("express");
var routes = require("./routes");
var cors = require("cors");
var app = express();

app.use(cors());
app.use("/", routes);

app.listen(3002);
console.log("Listening on 3002");

var PeerServer = require("peer").PeerServer;

const peerServerInstance = PeerServer({
  port: 3001,
  path: "/peerjs",
});

peerServerInstance.on("open", (peerId) => {
  console.log(`Connected with Peer ID: ${peerId}`);
});

peerServerInstance.on("disconnect", (peerId) => {
  console.log(`User Disconnected with ${peerId.getId()}`);
});
