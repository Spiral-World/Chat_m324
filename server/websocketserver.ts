import { Server } from 'http';
import { Server as WSServer, WebSocket, RawData } from 'ws';
import { DebouncedFunction, Message, User } from './interfaces';
import { debounce } from 'lodash';

let websocketServer: WSServer;

const activeUsers: User[] = [];
const typingUsers: User[] = [];

// Broadcast a message to all connected clients
const broadcastMessage = (message: Message) => {
  console.log('Broadcasting message', message);
  websocketServer.clients.forEach((client) => {
    try {
      client.send(JSON.stringify(message));
    } catch (err) {
      console.log(err);
    }
  });
};

// Intiiate the websocket server
const initializeWebsocketServer = (server: Server) => {
  websocketServer = new WSServer({ server });
  websocketServer.on('connection', onConnection);
};

// If a new connection is established, the onConnection function is called
const onConnection = (ws: WebSocket) => {
  console.log('New websocket connection');
  ws.on('message', (message) => onMessage(ws, message));
  ws.on('close', () => onClose(ws));
};

// If a connection is closed, the onClose function is called
const onClose = (ws: WebSocket) => {
  console.log('Websocket connection closed');
  const userIndex = activeUsers.findIndex((user) => user.ws === ws);
  if (userIndex !== -1) {
    console.log('User disconnected:', activeUsers[userIndex].name);
    const removedUser = activeUsers.splice(userIndex, 1);
    removeTypingStatus(removedUser[0].id);
    broadcastMessage({
      type: 'activeUsers',
      users: activeUsers,
    });
  }
};

// Remove a user from the typingUsers array and broadcast the new list
const removeTypingStatus = (userId: string) => {
  const userIndex = typingUsers.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    typingUsers.splice(userIndex, 1);
    broadcastMessage({
      type: 'typing',
      users: typingUsers,
    });
  }
};
const typingUsersDebounced: { [key: string]: DebouncedFunction } = {};

// If a new message is received, the onMessage function is called
  const onMessage = (ws: WebSocket, message: RawData) => {
  const messageObject = JSON.parse(message.toString()) as Message;
  console.log('Message received', messageObject);
  switch (messageObject.type) {
    case 'newUser':
      if (!messageObject.user?.id || activeUsers.find((user) => user.id === messageObject.user?.id)) return;
      activeUsers.push({ ...messageObject.user, ws });
      console.log('New user connected:', messageObject.user?.name);
      broadcastMessage({
        type: 'activeUsers',
        users: activeUsers.map((user) => ({ id: user.id, name: user.name })),
      });
      break;
    case 'message':
      if (!messageObject.user?.id || !messageObject.message) return;
      removeTypingStatus(messageObject.user.id);
      broadcastMessage({
        type: 'message',
        user: messageObject.user,
        message: messageObject.message,
      });
      break;
    case 'typing': {
      if (!messageObject.user?.id) return;
      console.log('typing', messageObject.user?.name);
      const existingUser = typingUsers.find((user) => user.id === messageObject.user?.id);
      if (existingUser) {
        typingUsersDebounced[messageObject.user.id]?.cancel();
      } else {
        typingUsers.push(messageObject.user);
        broadcastMessage({
          type: 'typing',
          users: typingUsers,
        });
      }
        typingUsersDebounced[messageObject.user.id] = debounce(() => {
        if (!messageObject.user?.id) return;
        removeTypingStatus(messageObject.user.id);
      }, 2000);
      typingUsersDebounced[messageObject.user.id]();
      break;
    }
    default:
      break;
  }
};

 export { initializeWebsocketServer };
