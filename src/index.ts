import app from './app';
const config = require('config');
import logger from './utils/logger';

import { MigrationRunner } from './data/migrationRunner';
import { BigQueryService } from './services/bigQueryService';


let bigQueryService = new BigQueryService();
new MigrationRunner(bigQueryService).runMigrations(config.get('google').bigQuery.dataSet)
    .then(() => {
        logger.info("migrations applied");
        // }).then(() => {
        //     let query =
        //         `
        //       SELECT *
        //       FROM acl
        //       `;
        //
        //
        //     bigQueryService.query(config.get('google').bigQuery.dataSet, query)
        //         .then((result) => {
        //             let allowedList = result;
        //             let allow = [];
        //             allowedList.forEach((allowed) => {
        //                 allow.push({
        //                     roles: allowed.role,
        //                     allows: [{ resources: allowed.resource, permissions: allowed.permission }]
        //                 });
        //             })
        //
        //
        //             return Promise.resolve(allow);
        //         });

    }).then(() => {
        const port = process.env.PORT || config.get('server').port;

        app.listen(port, (err) => {
            if (err) {
                return logger.error(err);
            }

            return logger.info(`server is listening on ${port}`);
        });
    }).catch((err) => {
        logger.error(err);
    });
    /*
TODO:
  Move passport to a middleware?
  load roles from BigQueryService
  */
