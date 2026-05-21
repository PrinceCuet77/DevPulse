import app from './app';
import config from './config';
import net from 'net';
import { initDB } from './db';

net.setDefaultAutoSelectFamily(false);

const main = () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`DevPulse application is listening on port ${config.port}`);
  });
};

main();
