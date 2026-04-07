import app from './server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

async function start(): Promise<void> {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Registry Service listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await app.close();
  process.exit(0);
});

start();
