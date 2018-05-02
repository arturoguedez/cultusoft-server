import { BigQueryService } from '../services/bigQueryService';
import { MigrationInterface } from './migrationInterface';

export class MigrationDownHandler {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationsTableName = this.migrationsTableName;
        this.bigQueryService = bigQueryService;
    }

    public handleDown(datasetId: string, migration: MigrationInterface) {
        return migration.down(this.bigQueryService, datasetId)
            .then(() => {
                return Promise.resolve();
            })
            .catch((err) => {
                return Promise.reject(`Rollback failed for migration ${migration.getName()}. Error: ${JSON.stringify(err)}`);
            });
    }
}
export default MigrationDownHandler;
