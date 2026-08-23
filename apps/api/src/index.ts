import { createServer } from "http";
import { app } from "./app";
import { setupWebSocket } from "./websocket";

const PORT = parseInt(process.env.API_PORT || "4000", 10);

const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`WebSocket running on path /ws`);
});

export { server };