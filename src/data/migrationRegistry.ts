import { MigrationInterface } from './migrationInterface';
import { CreateTableMigration } from './createTableMigration';
import { InsertTableMigration } from './insertTableMigration';
import { SetTableMetaDataMigration } from './setTableMetaDataMigration';

export class MigrationRegistry {
    public getRegistry() {
        let registry: MigrationInterface[] = [];
        registry.push(new CreateTableMigration('migration_0000002'));
        registry.push(new SetTableMetaDataMigration('migration_0000003'));
        registry.push(new InsertTableMigration('migration_0000004'));
        registry.push(new CreateTableMigration('migration_0000005'));
        return registry;
    }
}

export default MigrationRegistry;
