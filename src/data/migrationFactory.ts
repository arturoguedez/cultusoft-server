import { MigrationInterface } from './migrationInterface';
import { readFileSync } from 'fs';
import { CreateTableMigration } from './createTableMigration';
import { InsertTableMigration } from './insertTableMigration';
import { SetTableMetaDataMigration } from './setTableMetaDataMigration';
import logger from '../utils/logger';
export class MigrationFactory {
    private getContent(name: string): any {
        try {
            return JSON.parse(readFileSync(`${__dirname}/migrations/${name}`, "UTF-8"));
        } catch (e) {
            logger.error(`unable to parse migration file content ${name}`);
            throw e;
        }
    }

    public create(name: string): Promise<MigrationInterface> {
        let content = this.getContent(name);
        switch (content.type) {
            case 'createTable':
                return Promise.resolve(new CreateTableMigration(name, content));
            case 'insertTable':
                return Promise.resolve(new InsertTableMigration(name, content));
            case 'setTableMetadDataMigration':
                return Promise.resolve(new SetTableMetaDataMigration(name, content));
            default:
                return Promise.reject(`Unknown migration type ${content.type}`);
        }
    }
}

export default MigrationFactory;
