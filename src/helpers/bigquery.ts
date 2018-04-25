// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('config');

export class BigQueryHelper {
  // Your Google Cloud Platform project ID
  private projectId : string;

  // Creates a client
  private bigquery;
    constructor() {
      this.projectId = config.get('google').bigQuery.projectId;

        this.bigquery = new BigQuery({
          projectId: this.projectId,
        });
    }

    public createDateSet(datasetName: string) {
      return this.bigquery
        .createDataset(datasetName)
        .then(results => {
          const dataset = results[0];

          console.log(`Dataset ${dataset.id} created.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    }

    public listDatasets() {
      return this.bigquery
        .getDatasets()
        .then(results => {
          const datasets = results[0];
          console.log('Datasets:');
          let dataSetsArray = [];
          datasets.forEach(dataset => {
            console.log(dataset.id)
            dataSetsArray.push(dataset.id);
          });
          return new Promise(function (resolve) {
              resolve(dataSetsArray);
          });
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    }

    public deleteDataset(datasetId) {
      const dataset = this.bigquery.dataset(datasetId);

      // Deletes the dataset
      return dataset
        .delete()
        .then(() => {
          console.log(`Dataset ${dataset.id} deleted.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    }

    public createTable(datasetId:string , tableId:string , schema: string) {
      const options = {
        schema: schema,
      };
      // Create a new table in the dataset
      return this.bigquery
        .dataset(datasetId)
        .createTable(tableId, options)
        .then(results => {
          const table = results[0];
          console.log(`Table ${table.id} created.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    }
    public listTables(datasetId: string) {
      return this.bigquery
        .dataset(datasetId)
        .getTables()
        .then(results => {
          const tables = results[0];
          console.log('Tables:');
          let tablesArray = [];
          tables.forEach(table => {
            console.log(table.id)
            tablesArray.push(table.id);
          });

          return Promise.resolve(tablesArray);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    }

    public deleteTable(datasetId: string, tableId: string) {
      // Deletes the table
      this.bigquery
        .dataset(datasetId)
        .table(tableId)
        .delete()
        .then(() => {
          console.log(`Table ${tableId} deleted.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
    }

}
export default new BigQueryHelper();
