const stompit = require('stompit');
const { Subject } = require('rxjs');
const logger = require('../logger');

const projectEvents$ = new Subject();

let client = null;

const connectBroker = () => {
  const config = {
    host: process.env.ACTIVEMQ_HOST || 'localhost',
    port: parseInt(process.env.ACTIVEMQ_PORT || '61613'),
    connectHeaders: {
      host: '/',
      login: process.env.ACTIVEMQ_USER || 'admin',
      passcode: process.env.ACTIVEMQ_PASS || 'admin',
    },
  };

  stompit.connect(config, (err, c) => {
    if (err) {
      logger.error(`ActiveMQ connection error: ${err.message}`);
      return;
    }
    client = c;
    logger.info('Connected to ActiveMQ');
  });
};

const publishEvent = (eventType, payload) => {
  if (!client) {
    logger.warn('ActiveMQ not connected, skipping publish');
    return;
  }

  const headers = { destination: '/queue/projekti', 'content-type': 'application/json' };
  const frame = client.send(headers);
  frame.write(JSON.stringify({ eventType, payload, timestamp: new Date() }));
  frame.end();
  logger.info(`Published event: ${eventType}`);

  // Push to reactive stream
  projectEvents$.next({ eventType, payload });
};

module.exports = { connectBroker, publishEvent, projectEvents$ };