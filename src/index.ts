import app from './app';
const config = require('config');
import logger from './utils/logger';

import { MigrationRunner } from './data/migrationRunner';
import { BigQueryService } from './services/bigQueryService';

const port = process.env.PORT || config.get('server').port;

new MigrationRunner(new BigQueryService()).runMigrations(config.get('google').bigQuery.dataSet)
    .then(() => {
        logger.info("migrations applied");
    }).then(() => {
        app.listen(port, (err) => {
            if (err) {
                return logger.error(err);
            }

            return logger.info(`server is listening on ${port}`);
        });
    }).catch((err) => {
        logger.error(err);
    });
