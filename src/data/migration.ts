import { MigrationInterface } from './migrationInterface';
import { BigQueryHelper } from './bigQueryHelper';

export class Migration implements MigrationInterface {
    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public up(bigQueryHelper: BigQueryHelper, dataSet: string) {
    }

    public down(bigQueryHelper: BigQueryHelper, dataSet: string) {
    }

    public getName() {
        return this._name;
    }
}
