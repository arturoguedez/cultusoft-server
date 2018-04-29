import { Migration } from './migration';
import { BigQueryHelper } from './bigQueryHelper';

export class InsertTableMigration extends Migration {
    private tableId: string;
    private rows = [];
    private description: string;

    constructor(name: string, content: any) {
        super(name);
        this.tableId = content.tableId;
        this.rows = content.rows;
    }

    public up(bigQueryHelper: BigQueryHelper, dataSet: string) {
        if (!this.tableId) {
            return Promise.reject("Table id is not defined")
        };
        return bigQueryHelper.insert(dataSet, this.tableId, this.rows, null);
    }

    public down(bigQueryHelper: BigQueryHelper, dataSet: string) {
        return Promise.resolve();
    }
}

export default InsertTableMigration;
