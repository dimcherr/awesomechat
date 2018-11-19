const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors);

const uuidv4 = require("uuid/v4");
const {
  SSL_PRIVATE_KEY_PATH,
  SSL_FULL_CHAIN_PATH,
  PORT
} = require('./config');

const {
  SEND_MESSAGE,
  BROADCAST_DISCONNECT,
  BROADCAST_SEND_MESSAGE,
  BROADCAST_JOIN_ROOM,
  BROADCAST_NEW_CALL,
  BROADCAST_CALL,
  BROADCAST_END_CALL,
  JOIN_ROOM,
  USER_CONNECTED,
  CHECK_ROOM,
  CREATE_ROOM,
  ERROR,
  CALL,
  CALL_REQUEST,
  END_CALL
} = require("./events");
const Message = require("./message");
const User = require("./user");
const Room = require("./room");

var certOptions = {
  key: fs.readFileSync(path.resolve(SSL_PRIVATE_KEY_PATH)),
  cert: fs.readFileSync(path.resolve(SSL_FULL_CHAIN_PATH)),
  requestCert: false,
  rejectUnauthorized: false
};

const server = https.createServer(certOptions, app);
const io = require("socket.io").listen(server);
io.set("transports", ["xhr-polling", "websocket", "polling", "htmlfile"]);

const users = [];
const rooms = [];

server.listen(PORT);
console.log(`Listening to port ${PORT} running...`);

io.sockets.on("connection", socket => {
  // Create new user
  const user = new User(socket.id, null, null);
  users.push(user);

  console.log(USER_CONNECTED);

  // User connected
  socket.emit(USER_CONNECTED, { user });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("disconnect");
    const leavingUser = users.find(u => u.id === socket.id);
    if (!leavingUser) return;

    _.remove(users, u => u.id === leavingUser.id);

    console.log(`GLOBAL users:`, users.map(u => u.id));

    const room = rooms.find(r => r.id === leavingUser.roomId);
    if (!room) return;

    _.remove(room.users, u => u.id === leavingUser.id);

    console.log(`ROOM ${room.id} users:`, room.users.map(u => u.id));

    io.sockets.in(room.id).emit(BROADCAST_END_CALL, { userId: leavingUser.id });
    io.sockets
      .in(room.id)
      .emit(BROADCAST_DISCONNECT, { userId: leavingUser.id });
  });

  socket.on(CHECK_ROOM, (roomId, callback) => {
    console.log(CHECK_ROOM);
    callback(rooms.find(r => r.id === roomId));
  });

  // New room
  socket.on(CREATE_ROOM, (_user, callback) => {
    console.log(CREATE_ROOM);

    const newRoomId = uuidv4();
    const room = new Room(newRoomId);
    rooms.push(room);
    const user = users.find(u => u.id === socket.id);
    user.name = _user.name;
    user.roomId = newRoomId;
    room.addUser(user);

    socket.join(newRoomId);
    callback({ room, user });
  });

  socket.on(JOIN_ROOM, ({ roomId, user: _user }, callback) => {
    console.log(JOIN_ROOM);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const isUsernameTaken = room.users.find(u => u.name === _user.name);
      if (isUsernameTaken) {
        socket.emit(ERROR, {
          message: `Username "${_user.name}" is already taken in this room`
        });
        return;
      }

      const user = users.find(u => u.id === socket.id);
      user.name = _user.name;
      user.roomId = room.id;
      room.addUser(user);

      socket.join(room.id);
      callback({ room, user });
      io.sockets.in(roomId).emit(BROADCAST_JOIN_ROOM, {room, user });
    } else {
      socket.emit(ERROR, { message: "Room not found" });
      return;
    }
  });

  // Send Message
  socket.on(SEND_MESSAGE, ({ roomId, message }) => {
    console.log(SEND_MESSAGE);
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      socket.emit(ERROR, { message: "Room not found" });
      return;
    }
    const sender = room.users.find(u => u.id === message.fromUser.id);
    const receiver = room.users.find(u => u.id === message.toUser.id);
    const newMessage = new Message(
      uuidv4(),
      message.text,
      sender,
      receiver,
      new Date(Date.now())
    );
    room.addMessage(newMessage);
    io.sockets.in(room.id).emit(BROADCAST_SEND_MESSAGE, newMessage);
  });

  // Video Calling

  // Make call request
  socket.on(CALL_REQUEST, data => {
    console.log(CALL_REQUEST);
    const { roomId, user, isJustJoined } = data;
    user.id = socket.id;
    io.sockets.in(roomId).emit(BROADCAST_NEW_CALL, {
      user,
      allUsers: rooms.find(r => r.id === roomId).users,
      isJustJoined
    });
  });

  // Make rtc call
  socket.on(CALL, data => {
    console.log(CALL);
    const { roomId, user, to, candidate, sdp } = data;
    io.sockets.in(roomId).emit(BROADCAST_CALL, {
      from: socket.id,
      user,
      roomId,
      candidate,
      to,
      sdp
    });
  });

  // End call
  socket.on(END_CALL, data => {
    console.log(END_CALL);
    const { roomId, userId } = data;
    io.sockets.in(roomId).emit(BROADCAST_END_CALL, {
      userId
    });
  });
});
