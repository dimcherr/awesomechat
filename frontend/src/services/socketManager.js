import io from "socket.io-client";
import { SOCKET_URL } from "../config";
import {
  SEND_MESSAGE,
  BROADCAST_SEND_MESSAGE,
  BROADCAST_JOIN_ROOM,
  JOIN_ROOM,
  USER_CONNECTED,
  CHECK_ROOM,
  CREATE_ROOM,
  ERROR,
  CALL,
  CALL_REQUEST,
  BROADCAST_NEW_CALL,
  BROADCAST_CALL,
  BROADCAST_END_CALL,
  BROADCAST_DISCONNECT,
  END_CALL
} from "../events";

const socket = io(SOCKET_URL, { secure: true });

let onBroadcastDisconnectListener = null;
let onBroadcastSendMessageListener = null;
let onBroadcastJoinRoomListener = null;
let onBroadcastNewCallListener = null;
let onBroadcastCallListener = null;
let onBroadcastEndCallListener = null;
let onServerErrorListener = null;

export function setOnServerErrorListener(listener) {
  onServerErrorListener = listener;
}

export function setOnBroadcastDisconnectListener(listener) {
  onBroadcastDisconnectListener = listener;
}

export function setOnBroadcastSendMessageListener(listener) {
  onBroadcastSendMessageListener = listener;
}

export function setOnBroadcastJoinRoomListener(listener) {
  onBroadcastJoinRoomListener = listener;
}

export function setOnBroadcastNewCallListener(listener) {
  onBroadcastNewCallListener = listener;
}

export function setOnBroadcastCallListener(listener) {
  onBroadcastCallListener = listener;
}

export function setOnBroadcastEndCallListener(listener) {
  onBroadcastEndCallListener = listener;
}

export function initSocket() {
  socket.on(ERROR, data => {
    if (onServerErrorListener) {
      onServerErrorListener(data);
    }
  });

  socket.on(USER_CONNECTED, data => {
  });

  socket.on(BROADCAST_DISCONNECT, data => {
    if (onBroadcastDisconnectListener) {
      onBroadcastDisconnectListener(data);
    }
  });

  socket.on(BROADCAST_SEND_MESSAGE, data => {
    if (onBroadcastSendMessageListener) {
      onBroadcastSendMessageListener(data);
    }
  });

  socket.on(BROADCAST_JOIN_ROOM, room => {
    if (onBroadcastJoinRoomListener) {
      onBroadcastJoinRoomListener(room);
    }
  });

  socket.on(BROADCAST_NEW_CALL, data => {
    if (onBroadcastNewCallListener) {
      onBroadcastNewCallListener(data);
    }
  });

  socket.on(BROADCAST_CALL, data => {
    if (onBroadcastCallListener) {
      onBroadcastCallListener(data);
    }
  });

  socket.on(BROADCAST_END_CALL, data => {
    if (onBroadcastEndCallListener) {
      onBroadcastEndCallListener(data);
    }
  });
}

export function emitSendMessage(roomId, fromUser, toUser, messageText) {
  socket.emit(SEND_MESSAGE, {
    roomId,
    message: { fromUser, toUser, text: messageText }
  });
}
export function emitJoinRoom(roomId, user, callback) {
  socket.emit(JOIN_ROOM, { roomId, user }, callback);
}
export function emitCheckRoom(roomId, callback) {
  socket.emit(CHECK_ROOM, roomId, callback);
}
export function emitCreateRoom(user, callback) {
  socket.emit(CREATE_ROOM, user, callback);
}

export function emitCall(data) {
  socket.emit(CALL, data);
}

export function emitCallRequest(roomId, user, isJustJoined) {
  socket.emit(CALL_REQUEST, { roomId, user, isJustJoined });
}

export function emitEndCall(roomId, userId) {
  socket.emit(END_CALL, { roomId, userId });
}