import express from 'express';
import http from 'http';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import { Request, Response } from 'express';
import { initializeWebsocketServer } from './websocketserver';
import { WebSocket } from 'ws';

// Create the express server
const app = express();
const server = http.createServer(app);

const myVar = 1;

// create a livereload server
const env = process.env.NODE_ENV || 'development';
if (env !== 'production' && env !== 'test') {
  const liveReloadServer = livereload.createServer();
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/');
    }, 100);
  });
  // use livereload middleware
  app.use(connectLiveReload());
}

// deliver static files from the client folder like css, js, images
app.use(express.static('client'));
// route for the homepage
app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/client/index.html');
});

// Healthckeck interface for a 
app.get('/Healthckeck', (req: Request, res: Response) => {
  res.status(200).json({
    "message": "this interface works"
  });
});

// Initialize the websocket server
initializeWebsocketServer(server);

//start the web server
const startServer = (serverPort: number) => {
  server.listen(serverPort, () => {
    console.log(`Express Server started on port ${serverPort} as '${env}' Environment`);
  });
  return server;
};

if (env !== 'test') {
  const serverPort = parseInt(process.env.PORT || '3000');
  startServer(serverPort);
}

const waitForSocketState = (socket: WebSocket, state: any) => {
  return new Promise(function (resolve) {
    setTimeout(function () {
      if (socket.readyState === state) {
        resolve(undefined);
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    }, 5);
  });
};

export { startServer, waitForSocketState };
