// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('config');
import BigQueryHelper from './bigQueryHelper';
import { MigrationRegistry } from './migrationRegistry';
import { MigrationInterface } from './migrationInterface';

export class MigrationRunner {
    // Your Google Cloud Platform project ID
    private projectId: string;
    private migrationsTableName: string;
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
                return BigQueryHelper.createDateSet(datasetId);
            }
        }
        )
    };

    private initMigrationTable(datasetId: string) {
        return BigQueryHelper.listTables(datasetId).then((tableNames) => {
            let migrationTableExists: boolean = false;
            tableNames.forEach(tableName => {
                if (tableName === this.migrationsTableName) {
                    migrationTableExists = true;
                }
            });

            if (migrationTableExists) {
                return Promise.resolve();
            } else {
                return BigQueryHelper.createTable(datasetId, this.migrationsTableName, 'Name:STRING, AppliedOn:TIMESTAMP')
            }
        })
    };

    private applyMigrations(datasetId: string, pendingMigrations: MigrationInterface[]) {
        let promises = [];

        pendingMigrations.forEach((migration) => {
            promises.push(new Promise((resolve, reject) => {
                migration.up(BigQueryHelper, datasetId)
                    .then(() => {
                        const toInsert = {
                            Name: migration.getName(),
                            AppliedOn: new Date()
                        }
                        console.log("Migration " + migration.getName() + " applied successfully");
                        BigQueryHelper.insert(datasetId, this.migrationsTableName, toInsert, null)
                            .then((data) => {
                                resolve();
                            })
                            .catch((err) => {
                                reject("Errors found while recording the migration history: " + JSON.stringify(err));
                            });
                    })
                    .catch((err) => {
                        migration.down(BigQueryHelper, datasetId)
                            .then(() => {
                                reject("Unable to apply migration " + migration.getName() + ". It has been rolled back. Error: " + JSON.stringify(err));
                            })
                            .catch((err) => {
                                reject("Rollback failed " + err + " " + JSON.stringify(err));
                            });
                    });
            }));
        })

        return Promise.all(promises);
    }

    private getPendingMigrations(datasetId: string): Promise<MigrationInterface[]> {
        let registry: MigrationInterface[] = new MigrationRegistry().getRegistry();

        return new Promise<MigrationInterface[]>((resolve, reject) => {
            this.bigquery
                .dataset(datasetId)
                .table(this.migrationsTableName)
                .getRows()
                .then(results => {
                    const rows = results[0];
                    let pendingMigration = registry.filter((registeredMigration) => {
                        return rows.every((row) => {
                            return registeredMigration.getName() !== row.Name;
                        })
                    });
                    return resolve(pendingMigration);
                }).catch((err) => {
                    return reject(err);
                })
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
            .then((pendingMigrations: MigrationInterface[]) => {
                return this.applyMigrations(datasetId, pendingMigrations);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }
}
export default new MigrationRunner();
