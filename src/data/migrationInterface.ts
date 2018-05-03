import { BigQueryService } from '../services/bigQueryService';

export interface MigrationInterface {
    up(bigQueryService: BigQueryService, dataSet: string): Promise<any>;
    down(bigQueryService: BigQueryService, dataSet: string): Promise<any>;
    getName(): string;
}
