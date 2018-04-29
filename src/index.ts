import app from './app';
const config = require('config');
// import BigQueryHelper from './helpers/bigquery';
import MigrationRunner from './data/migrationRunner';

const port = process.env.PORT || config.get('server').port;

MigrationRunner.runMigrations(config.get('google').bigQuery.dataSet).then(() => {
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
