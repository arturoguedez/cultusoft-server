import { BigQueryService } from '../services/bigQueryService';
import { MigrationApplier } from './migrationApplier';
import { PendingMigrationRetriever } from './pendingMigrationRetriever';
import { MigrationTableInitializer } from './migrationTableInitializer';
import { DatasetInitializer } from './datasetInitializer';

export class MigrationRunner {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService) {
        this.migrationsTableName = 'migrations';
        this.bigQueryService = bigQueryService;
    }

    private initDataset(datasetId: string) {
        return new DatasetInitializer(this.bigQueryService).initDataset(datasetId);
    }

    private initMigrationTable(datasetId: string) {
        return new MigrationTableInitializer(this.bigQueryService, this.migrationsTableName).initMigrationTable(datasetId);
    };

    private applyMigrations(datasetId: string, pendingMigrations: string[]) {
        return new MigrationApplier(this.bigQueryService, this.migrationsTableName).applyMigrations(datasetId, pendingMigrations);
    }

    private getPendingMigrations(datasetId: string): Promise<string[]> {
        return new PendingMigrationRetriever(this.bigQueryService, this.migrationsTableName).getPendingMigrations(datasetId);
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
export default MigrationRunner;
