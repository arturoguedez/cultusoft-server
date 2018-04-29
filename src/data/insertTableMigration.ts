import { Migration } from './migration';
import { BigQueryService } from '../services/bigQueryService';

export class InsertTableMigration extends Migration {
    private tableId: string;
    private rows = [];
    private description: string;

    constructor(name: string, content: any) {
        super(name);
        this.tableId = content.tableId;
        this.rows = content.rows;
    }

    public up(bigQueryService: BigQueryService, dataSet: string) {
        if (!this.tableId) {
            return Promise.reject("Table id is not defined")
        };
        return bigQueryService.insert(dataSet, this.tableId, this.rows, null);
    }

    public down(bigQueryService: BigQueryService, dataSet: string) {
        return Promise.resolve();
    }
}

export default InsertTableMigration;
