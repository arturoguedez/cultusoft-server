// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('config');
import BigQueryHelper from './bigquery';

export class MigrationRunner {
  // Your Google Cloud Platform project ID
  private projectId : string;
  private migrationsTableName: string;

  // Creates a client
  private bigquery;
    constructor() {
      this.projectId = config.get('google').bigQuery.projectId;

        this.bigquery = new BigQuery({
          projectId: this.projectId,
        });
        this.migrationsTableName = 'migrations';
    }

    private initDataset(datasetName: string) {
      return BigQueryHelper.listDatasets().then((dataSets) => {
        let dataSetExists: boolean = false;
        dataSets.forEach(dataSet => {
          if (dataSet === datasetName) {
            dataSetExists = true;
          }
        });

        if (dataSetExists) {
            return Promise.resolve();
        } else {
          console.log("the dataset does not exist, creating it");
          return BigQueryHelper.createDateSet(datasetName);
        }
    }
  )};

    private initMigrationTable(datasetName: string) {
      return BigQueryHelper.listTables(datasetName).then((tableNames) => {
        let migrationTableExists: boolean = false;
        tableNames.forEach(tableName => {
            if (tableName === this.migrationsTableName) {
              migrationTableExists = true;
            }
        })

        if (migrationTableExists) {
          console.log("Migration table exists!");
          return Promise.resolve();
        } else {
          console.log("need to create the migration table!");
          return BigQueryHelper.createTable(datasetName, this.migrationsTableName,'Name:STRING, AppliedOn:DATETIME')

        }
    })};

    public runMigrations(datasetName: string) {
        return this.initDataset(datasetName)
        .then(() => {
          return this.initMigrationTable(datasetName);
        })



    }
}
export default new MigrationRunner();
