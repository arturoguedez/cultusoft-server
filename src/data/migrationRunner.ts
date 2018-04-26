// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('config');
import BigQueryHelper from './bigQueryHelper';
import { MigrationRegistry } from './migrationRegistry';
import { MigrationInterface } from './migrationInterface';

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

    private initDataset(datasetId: string) {
      return BigQueryHelper.listDatasets().then((dataSets) => {
        let dataSetExists: boolean = false;
        dataSets.forEach(dataSet => {
          if (dataSet === datasetId) {
            dataSetExists = true;
          }
        });

        if (dataSetExists) {
            return Promise.resolve();
        } else {
          console.log("the dataset does not exist, creating it");
          return BigQueryHelper.createDateSet(datasetId);
        }
    }
  )};

    private initMigrationTable(datasetId: string) {
      return BigQueryHelper.listTables(datasetId).then((tableNames) => {
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
          return BigQueryHelper.createTable(datasetId, this.migrationsTableName,'Name:STRING, AppliedOn:DATETIME')

        }
    })};

    private applyMigrations(datasetId: string, pendingMigrations:MigrationInterface[]) {
      let i = 0;
      for (i = 0; i < pendingMigrations.length; i+= 1) {
        let migration:MigrationInterface = pendingMigrations[i];
        console.log("applying migration for " + migration.getName());
        migration.up(BigQueryHelper, datasetId);
      }

      return Promise.resolve();
    }
    private getPendingMigrations (datasetId: string) : Promise<MigrationInterface[]> {
        let registry : MigrationInterface[] = new MigrationRegistry().getRegistry();
        let pendingMigration:MigrationInterface[] = [];

        return new Promise<MigrationInterface[]>((resolve, reject) => {
          this.bigquery
            .dataset(datasetId)
            .table(this.migrationsTableName)
            .getRows()
            .then(results => {
              const rows = results[0];
              console.log('Rows:');
              rows.forEach(row => {
                console.log(row)
              });


              registry.forEach(registrationMigration => {
                console.log("my name is" + registrationMigration.getName());
              });
                // return resolve(pendingMigration);
                resolve(registry);
            })
            .catch(err => {
              console.error('ERROR:', err);
              reject(err);
            });
        });








    }

    public runMigrations(datasetId: string) {
        return this.initDataset(datasetId)
        .then(() => {
          return this.initMigrationTable(datasetId);
        })
        .then(() => {
          return this.getPendingMigrations(datasetId);
        })
        .then((pendingMigrations:MigrationInterface[]) => {
          return this.applyMigrations(datasetId, pendingMigrations);
        })
        .catch((error) => {
          console.log("an error was caught" + error);
        });
    }
}
export default new MigrationRunner();
