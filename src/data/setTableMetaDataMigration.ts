import { Migration } from './migration';
import { BigQueryHelper } from './bigQueryHelper';

export class SetTableMetaDataMigration extends Migration {
    private tableId: string;
    private schema: string;
    private name: string;
    private description: string;

    constructor(name: string) {
        super(name);
        let content = this.getContent();
        this.tableId = content.tableId;
        this.schema = content.schema;
        this.name = content.name;
        this.description = content.description;
    }

    public up(bigQueryHelper: BigQueryHelper, dataSet: string) {
        if (!this.tableId || !this.schema) {
            return Promise.reject("Table id or schema not defined")
        }
        return bigQueryHelper.setTableMetaData(dataSet, this.tableId, this.schema, this.name, this.description);
    }

    public down(bigQueryHelper: BigQueryHelper, dataSet: string) {
        return Promise.resolve();
    }
}

export default SetTableMetaDataMigration;
