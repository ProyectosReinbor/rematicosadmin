import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { eventBus, SystemEvent } from "@rematicos/events";

let io: SocketIOServer | null = null;

export function setupWebSocket(server: HTTPServer): SocketIOServer {
  const allowedOrigins = [
    process.env.WEB_URL || "http://localhost:3000",
    process.env.STORE_URL || "http://localhost:3001",
  ];

  io = new SocketIOServer(server, {
    path: "/ws",
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);

    socket.on("join-payments", () => {
      socket.join("payments");
    });

    socket.on("disconnect", () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  eventBus.subscribe("PaymentReceived", async (event: SystemEvent) => {
    if (event.type === "PaymentReceived") {
      io?.to("payments").emit("payment:received", event.data);
    }
  });

  eventBus.subscribe("PaymentSaved", async (event: SystemEvent) => {
    if (event.type === "PaymentSaved") {
      io?.to("payments").emit("payment:saved", event.data);
    }
  });

  eventBus.subscribe("VoiceAnnouncementRequested", async (event: SystemEvent) => {
    if (event.type === "VoiceAnnouncementRequested") {
      io?.to("payments").emit("voice:announce", event.data);
    }
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}