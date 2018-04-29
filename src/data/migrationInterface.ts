import { BigQueryService } from '../services/bigQueryService';

export interface MigrationInterface {
    up(bigQueryService: BigQueryService, dataSet: string);
    down(bigQueryService: BigQueryService, dataSet: string);
    getName(): string;
}
