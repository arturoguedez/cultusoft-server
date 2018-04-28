import { Migration } from './migration';
import { BigQueryHelper } from './bigQueryHelper';
const fs = require(`fs`);

export class CreateTableMigration extends Migration {
    private tableId: string;
    private schema: string;

    constructor(name: string) {
        super(name);
        let content = this.getContent();
        this.tableId = content.tableId;
        this.schema = content.schema;
    }

    public up(bigQueryHelper: BigQueryHelper, dataSet: string) {
        if (!this.tableId || !this.schema) {
            return Promise.reject("Table id or schema not defined")
        };
        return bigQueryHelper.createTable(dataSet, this.tableId, this.schema);
    }

    public down(bigQueryHelper: BigQueryHelper, dataSet: string) {
        if (!this.tableId || !this.schema) {
            return Promise.reject("Table id or schema not defined")
        };
        return bigQueryHelper.deleteTable(dataSet, this.tableId);
    }
}

export default CreateTableMigration;
