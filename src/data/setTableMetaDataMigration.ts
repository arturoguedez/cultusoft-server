import { Migration } from './migration';
import { BigQueryService } from '../services/bigQueryService';

export class SetTableMetaDataMigration extends Migration {
    private tableId: string;
    private schema: string;
    private name: string;
    private description: string;

    constructor(name: string, content: any) {
        super(name);
        this.tableId = content.tableId;
        this.schema = content.schema;
        this.name = content.name;
        this.description = content.description;
    }

    public up(bigQueryService: BigQueryService, dataSet: string) {
        if (!this.tableId || !this.schema) {
            return Promise.reject("Table id or schema not defined")
        }
        return bigQueryService.setTableMetaData(dataSet, this.tableId, this.schema, this.name, this.description);
    }

    public down(bigQueryService: BigQueryService, dataSet: string) {
        return Promise.resolve();
    }
}

export default SetTableMetaDataMigration;
