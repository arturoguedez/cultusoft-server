import { MigrationInterface } from './migrationInterface';
import { readFileSync } from 'fs';
import { CreateTableMigration } from './createTableMigration';
import { InsertTableMigration } from './insertTableMigration';
import { SetTableMetaDataMigration } from './setTableMetaDataMigration';

export class MigrationFactory {
    private getContent(name: string): any {
        return JSON.parse(readFileSync(`${__dirname}/migrations/${name}`, "UTF-8"));
    }

    public create(name: string): MigrationInterface {
        let content = this.getContent(name);
        switch (content.type) {
            case 'createTable':
                return new CreateTableMigration(name, content);
            case 'insertTable':
                return new InsertTableMigration(name, content);
            case 'setTableMetadDataMigration':
                return new SetTableMetaDataMigration(name, content);
            default:
                throw new Error(`Unknown migration type ${content.type}`);
        }
    }
}

export default MigrationFactory;
