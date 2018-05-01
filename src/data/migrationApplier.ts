import { BigQueryService } from '../services/bigQueryService';
import { MigrationFactory } from './migrationFactory';

export class MigrationApplier {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationsTableName = this.migrationsTableName;
        this.bigQueryService = bigQueryService;
    }

    public applyMigrations(datasetId: string, pendingMigrations: string[]) {
        let migrationFactory = new MigrationFactory();
        let migrationName = pendingMigrations.shift();

        if (!migrationName) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            let migration = migrationFactory.create(migrationName);
            console.log(`calling UP for ${migrationName}`);
            migration
                .up(this.bigQueryService, datasetId)
                .then(() => {
                    const toInsert = {
                        Name: migrationName,
                        AppliedOn: new Date()
                    }
                    console.log(`Migration ${migrationName} applied successfully`);
                    this.bigQueryService.insert(datasetId, this.migrationsTableName, toInsert, null)
                        .then((data) => {
                            return resolve();
                        })
                        .catch((err) => {
                            return reject(`Errors found while recording the migration history: ${JSON.stringify(err)}`);
                        });
                })
                .catch((err) => {
                    console.log(`calling DOWN for ${migrationName}`);
                    migration.down(this.bigQueryService, datasetId)
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
}
export default MigrationApplier;
