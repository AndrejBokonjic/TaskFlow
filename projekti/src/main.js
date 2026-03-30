const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { initDb } = require('./infrastruktura/database');
const { connectBroker, projectEvents$ } = require('./infrastruktura/messageBroker');
const routes = require('./api/routes');
const logger = require('./logger');

const app = express();
app.use(express.json());

// Swagger
const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Routes
app.use('/', routes);

// Reactive stream — log all project events
projectEvents$.subscribe(event => {
  logger.info(`[RxJS Stream] Event received: ${event.eventType} -> ${JSON.stringify(event.payload)}`);
});

const start = async () => {
  await initDb();
  connectBroker();
  app.listen(3000, () => logger.info('projekti service running on port 3000'));
};

start();