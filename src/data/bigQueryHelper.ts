// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('config');

export class BigQueryHelper {
    // Your Google Cloud Platform project ID
    private projectId: string;
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
                let dataSetsArray = [];
                datasets.forEach(dataset => {
                    dataSetsArray.push(dataset.id);
                });
                return Promise.resolve(dataSetsArray);
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    }
    // https://cloud.google.com/nodejs/docs/reference/bigquery/1.2.x/Table#insert
    public insert(datasetId: string, tableId: string, rows, options) {
        const dataset = this.bigquery.dataset(datasetId);
        const table = dataset.table(tableId);
        if (!options) {
            options = {};
        }

        return table.insert(rows, options);
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

    public createTable(datasetId: string, tableId: string, schema: string) {
        const options = {
            schema: schema,
        };
        // Create a new table in the dataset
        return new Promise((resolve, reject) => {
            this.bigquery
                .dataset(datasetId)
                .createTable(tableId, options)
                .then(results => {
                    resolve(results[0]);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
    public setTableMetaData(datasetId: string, tableId: string, schema: string, name: string, description: string) {
        const metadata = {
            schema: schema,
            name: name,
            description: description
        };
        return new Promise((resolve, reject) => {
            this.bigquery
                .dataset(datasetId)
                .table(tableId)
                .setMetadata(metadata)
                .then(results => {
                    resolve({ metadata: results[0], apiResponse: results[1] });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    public listTables(datasetId: string) {
        return this.bigquery
            .dataset(datasetId)
            .getTables()
            .then(results => {
                const tables = results[0];
                let tablesArray = [];
                tables.forEach(table => {
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
