import { BigQueryService } from '../services/bigQueryService';
import { MigrationFactory } from './migrationFactory';
import { MigrationUpHandler } from './migrationUpHandler';
import { MigrationDownHandler } from './migrationDownHandler';

export class MigrationApplier {
    private migrationFactory: MigrationFactory;
    private migrationUpHandler: MigrationUpHandler;
    private migrationDownHandler: MigrationDownHandler;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationFactory = new MigrationFactory();
        this.migrationUpHandler = new MigrationUpHandler(bigQueryService, migrationsTableName);
        this.migrationDownHandler = new MigrationDownHandler(bigQueryService, migrationsTableName);
    }

    public applyMigrations(datasetId: string, pendingMigrations: string[]) {
        let migrationName = pendingMigrations.shift();

        if (!migrationName) {
            return Promise.resolve();
        }

        return this.migrationFactory.create(migrationName)
            .then((migration) => {
                return this.migrationUpHandler.handleUp(datasetId, migration)
                    .then(() => {
                        return Promise.resolve();
                    })
                    .catch((err) => {
                        return this.migrationDownHandler.handleDown(datasetId, migration)
                            .then(() => {
                                return Promise.reject(`Migration ${migration.getName()} has been rolled back.`)
                            }).catch((err) => {
                                return Promise.reject(err);
                            });
                    });
            }).then(() => {
                return this.applyMigrations(datasetId, pendingMigrations);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
}
export default MigrationApplier;
