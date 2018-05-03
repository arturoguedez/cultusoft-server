import app from './app';
const config = require('config');

import { MigrationRunner } from './data/migrationRunner';
import { BigQueryService } from './services/bigQueryService';

const port = process.env.PORT || config.get('server').port;

new MigrationRunner(new BigQueryService()).runMigrations(config.get('google').bigQuery.dataSet).then(() => {
    console.log("migrations applied");
}).catch((err) => {
    console.log(err);
});
//
// app.listen(port, (err) => {
//   if (err) {
//     return console.log(err);
//   }
//
//   return console.log(`server is listening on ${port}`);
// });
