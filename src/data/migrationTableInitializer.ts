import { BigQueryService } from '../services/bigQueryService';

export class MigrationTableInitializer {
    private migrationsTableName: string;
    private bigQueryService: BigQueryService;

    constructor(bigQueryService: BigQueryService, migrationsTableName: string) {
        this.migrationsTableName = migrationsTableName;
        this.bigQueryService = bigQueryService;
    }

    public initMigrationTable(datasetId: string) {
        return this.bigQueryService.listTables(datasetId)
            .then((tableNames) => {
                let migrationTableExists: boolean = tableNames.some((tableName) => {
                    return tableName === this.migrationsTableName;
                });

                if (migrationTableExists) {
                    return Promise.resolve();
                } else {
                    return this.bigQueryService.createTable(datasetId, this.migrationsTableName, 'Name:STRING, AppliedOn:TIMESTAMP');
                }
            })
    };
}

export default MigrationTableInitializer;
