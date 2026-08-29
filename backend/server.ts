import 'dotenv/config';
import http from 'http';
import app from './src/app';
import connectDB from './src/config/db';
import { initSocket } from './src/sockets/socket';
import './src/queue/analysis.worker';

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(port, () => {
      console.log(`server running on port ${port}`);
    });
  } catch (error) {
    console.log('server failed to start', error);
    process.exit(1);
  }
};

startServer();