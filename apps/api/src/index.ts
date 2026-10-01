import { createServer } from "http";
import { PrismaClient } from "@prisma/client";
import { app } from "./app";
import { setupWebSocket } from "./websocket";
import { ensureBaseCategories } from "./services/base-categories-service";

const PORT = parseInt(process.env.API_PORT || "4000", 10);

const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`WebSocket running on path /ws`);
});

// Las categorías base del catálogo se definen en código; se sincronizan al
// arrancar para que existan aunque la base de datos se haya creado con
// `prisma db push` (que no ejecuta migraciones).
const prisma = new PrismaClient();
ensureBaseCategories(prisma)
  .then(({ created, iconsFilled }) => {
    if (created || iconsFilled) {
      console.log(`Categorías base sincronizadas (${created} creadas, ${iconsFilled} iconos completados)`);
    }
  })
  .catch((err) => console.error("No fue posible sincronizar las categorías base:", err))
  .finally(() => prisma.$disconnect());

export { server };
