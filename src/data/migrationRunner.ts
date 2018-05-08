import { BigQueryService } from '../services/bigQueryService';
import { MigrationApplier } from './migrationApplier';
import { PendingMigrationRetriever } from './pendingMigrationRetriever';
import { MigrationTableInitializer } from './migrationTableInitializer';
import { DatasetInitializer } from './datasetInitializer';
import logger from '../utils/logger';

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

    public async runMigrations(datasetId: string): Promise<any> {
        try {
            await this.initDataset(datasetId)
            await this.initMigrationTable(datasetId);
            let pendingMigrations: string[] = await this.getPendingMigrations(datasetId)
            await this.applyMigrations(datasetId, pendingMigrations);
            logger.info("migrations applied");
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        };
    }
}
export default MigrationRunner;
