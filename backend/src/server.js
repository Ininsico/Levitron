import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './db.js';
import { assertTokenSecret } from './lib/tokens.js';

const port = Number(process.env.PORT ?? 4000);

async function start() {
  assertTokenSecret();
  await connectDatabase(process.env.MONGO_URI);

  const app = createApp();

  const server = app.listen(port, () => {
    console.log(`Levitron API listening on http://localhost:${port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });
  }
}

start().catch((error) => {
  console.error(`Failed to start Levitron API: ${error.message}`);
  process.exit(1);
});
