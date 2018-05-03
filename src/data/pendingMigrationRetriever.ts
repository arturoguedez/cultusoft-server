// Imports the Google Cloud client library
import { BigQueryService } from '../services/bigQueryService';
import { MigrationRegistry } from './migrationRegistry';

export class PendingMigrationRetriever {
    private bigQueryService: BigQueryService;
    private migrationsTableName: string;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.bigQueryService = bigQueryService;
        this.migrationsTableName = migrationsTableName;
    }

    public getPendingMigrations(datasetId: string): Promise<string[]> {
        let registry: string[] = new MigrationRegistry().getRegistry();
        return new Promise<string[]>((resolve, reject) => {
            this.bigQueryService.getRows(datasetId, this.migrationsTableName)
                .then(rows => {
                    let pendingMigration = registry.filter((registeredMigration) => {
                        return rows.every((row) => {
                            return registeredMigration !== row.Name;
                        })
                    });
                    return resolve(pendingMigration);
                }).catch((err) => {
                    return reject(err);
                });
        });
    }
}
export default PendingMigrationRetriever;
