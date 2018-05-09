import { BigQueryService } from '../services/bigQueryService';
import { MigrationInterface } from './migrationInterface';

export class MigrationUpHandler {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationsTableName = migrationsTableName;
        this.bigQueryService = bigQueryService;
    }

    public handleUp(datasetId: string, migration: MigrationInterface) {
        const migrationName = migration.getName();
        return migration.up(this.bigQueryService, datasetId)
            .then(() => {
                const toInsert = {
                    AppliedOn: new Date(),
                    Name: migrationName
                };

                return this.bigQueryService.insert(datasetId, this.migrationsTableName, toInsert, null)
                    .then(() => {
                        return Promise.resolve();
                    })
                    .catch((err) => {
                        return Promise.reject(`Errors found while recording the migration history: ${JSON.stringify(err)}`);
                    });
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
}
export default MigrationUpHandler;
