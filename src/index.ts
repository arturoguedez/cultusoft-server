import app from './app';
const config = require('config');
// import BigQueryHelper from './helpers/bigquery';
import MigrationRunner from './helpers/migrationRunner';

const port = process.env.PORT || config.get('server').port;

console.log("About to call big query");
// BigQueryHelper.createDateSet('arturo_development2')
//   .then(() => {
//     return BigQueryHelper.listDatasets();
//   })
//   .then(() => {
//     return BigQueryHelper.createTable('arturo_development2', 'table1',
//     'Name:string, Age:integer, Weight:float, IsMagic:boolean')
//     //return BigQueryHelper.deleteDataset('arturo_development2');
//   });

MigrationRunner.runMigrations(config.get('google').bigQuery.dataSet);
//
// app.listen(port, (err) => {
//   if (err) {
//     return console.log(err);
//   }
//
//   return console.log(`server is listening on ${port}`);
// });
