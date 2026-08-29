import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-analysis", (analysisId: string) => {
      socket.join(analysisId);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("socket.io not initialized");
  }
  return io;
};

export const emitAnalysisProgress = (analysisId: string, data: any) => {
  if (!io) return;
  io.to(analysisId).emit("analysis:progress", data);
};