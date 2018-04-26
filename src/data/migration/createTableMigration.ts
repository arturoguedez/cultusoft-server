import { Migration } from './migration';
import {BigQueryHelper} from './../bigQueryHelper';

export class CreateTableMigration extends Migration {

  tableId: string;
  schema: string;

  constructor(name:string, tableId: string, schema: string) {
    super(name);
    this.tableId = tableId;
    this.schema = schema;
  }

  public up (bigQueryHelper: BigQueryHelper, dataSet: string) {
    return bigQueryHelper.createTable(dataSet, this.tableId, this.schema);
  }

  public down (bigQueryHelper: BigQueryHelper, dataSet: string) {
    return bigQueryHelper.deleteTable(dataSet, this.tableId);
  }
}

export default CreateTableMigration;
