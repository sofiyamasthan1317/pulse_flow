import { createServer } from "node:http";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { startOverdueTasksScheduler } from "./jobs/overdueTasks.job.js";
import { initializeSocket } from "./websocket/socket.js";

const startServer = () => {
  try {
    const server = createServer(app);
    initializeSocket(server);
    startOverdueTasksScheduler();

    server.listen(env.PORT, () => {
      console.info(`Server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
