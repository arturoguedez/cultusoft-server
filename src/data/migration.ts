import { MigrationInterface } from './migrationInterface';
import { BigQueryService } from '../services/bigQueryService';

export class Migration implements MigrationInterface {
    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public up(bigQueryService: BigQueryService, dataSet: string) {
    }

    public down(bigQueryService: BigQueryService, dataSet: string) {
    }

    public getName() {
        return this._name;
    }
}
