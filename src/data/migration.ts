import { MigrationInterface } from './migrationInterface';
import { BigQueryHelper } from './bigQueryHelper';
const fs = require(`fs`);

export class Migration implements MigrationInterface {

    private _name: string;
    private _content: string;

    constructor(name: string) {
        this._name = name;
        this._content = JSON.parse(fs.readFileSync(__dirname + '/migrations/' + name + ".json"));
    }

    protected getContent(): any {
        return this._content;
    }

    public up(bigQueryHelper: BigQueryHelper, dataSet: string) {

    }
    public down(bigQueryHelper: BigQueryHelper, dataSet: string) {
    }

    public getName() {
        return this._name;
    }
}
