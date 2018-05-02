import { BigQueryService } from '../services/bigQueryService';
import { MigrationInterface } from './migrationInterface';

export class MigrationUpHandler {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationsTableName = this.migrationsTableName;
        this.bigQueryService = bigQueryService;
    }

    public handleUp(datasetId: string, migration: MigrationInterface) {
        let migrationName = migration.getName();
        console.log(`calling UP for ${migrationName}`);
        return migration.up(this.bigQueryService, datasetId)
            .then(() => {
                const toInsert = {
                    Name: migrationName,
                    AppliedOn: new Date()
                }
                console.log(`Migration ${migrationName} applied successfully`);
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
