// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('config');
import BigQueryService from '../services/bigQueryService';
import { MigrationRegistry } from './migrationRegistry';
import { MigrationFactory } from './migrationFactory';
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
        return BigQueryService.listDatasets().then((dataSets) => {
            let dataSetExists: boolean = dataSets.some((dataSet) => {
                return dataSet === datasetId;
            });

            if (dataSetExists) {
                return Promise.resolve();
            } else {
                return BigQueryService.createDateSet(datasetId);
            }
        }
        );
    }

    private initMigrationTable(datasetId: string) {
        return BigQueryService.listTables(datasetId).then((tableNames) => {
            let migrationTableExists: boolean = tableNames.some((tableName) => {
                return tableName === this.migrationsTableName;
            });

            if (migrationTableExists) {
                return Promise.resolve();
            } else {
                return BigQueryService.createTable(datasetId, this.migrationsTableName, 'Name:STRING, AppliedOn:TIMESTAMP')
            }
        })
    };

    private applyMigrations(datasetId: string, pendingMigrations: string[]) {
        let migrationFactory = new MigrationFactory();
        let migrationName = pendingMigrations.shift();
        if (!migrationName) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            let migration = migrationFactory.create(migrationName);
            console.log(`calling UP for ${migrationName}`);
            migration
                .up(BigQueryService, datasetId)
                .then(() => {
                    const toInsert = {
                        Name: migrationName,
                        AppliedOn: new Date()
                    }
                    console.log(`Migration ${migrationName} applied successfully`);
                    BigQueryService.insert(datasetId, this.migrationsTableName, toInsert, null)
                        .then((data) => {
                            return resolve();
                        })
                        .catch((err) => {
                            return reject(`Errors found while recording the migration history: ${JSON.stringify(err)}`);
                        });
                })
                .catch((err) => {
                    console.log(`calling DOWN for ${migrationName}`);
                    migration.down(BigQueryService, datasetId)
                        .then(() => {
                            reject(`Unable to apply migration ${migrationName}. It has been rolled back. Error: ${JSON.stringify(err)}`);
                        })
                        .catch((err) => {
                            reject(`Rollback failed ${err} ${JSON.stringify(err)}`);
                        });
                });
        }).then(() => {
            return this.applyMigrations(datasetId, pendingMigrations);
        }).catch((err) => {
            return Promise.reject(err);
        }
        );
    }

    private getPendingMigrations(datasetId: string): Promise<string[]> {
        let registry: string[] = new MigrationRegistry().getRegistry();

        return new Promise<string[]>((resolve, reject) => {
            this.bigquery
                .dataset(datasetId)
                .table(this.migrationsTableName)
                .getRows()
                .then(results => {
                    const rows = results[0];
                    let pendingMigration = registry.filter((registeredMigration) => {
                        return rows.every((row) => {
                            return registeredMigration !== row.Name;
                        })
                    });

                    console.log('registry =');
                    console.log(registry);
                    console.log('pending:');
                    console.log(pendingMigration);
                    return resolve(pendingMigration);
                }).catch((err) => {
                    return reject(err);
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
            .then((pendingMigrations: string[]) => {
                return this.applyMigrations(datasetId, pendingMigrations);
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }
}
export default new MigrationRunner();
