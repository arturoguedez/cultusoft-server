import {BigQueryHelper} from './bigQueryHelper';

export interface MigrationInterface {
    up (bigQueryHelper: BigQueryHelper, dataSet: string);
    down (bigQueryHelper: BigQueryHelper, dataSet: string);
    getName () : string;
}
