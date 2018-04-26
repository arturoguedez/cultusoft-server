import { MigrationInterface } from './migrationInterface';
import {CreateTableMigration}from './migration/createTableMigration';

export class MigrationRegistry {
  public getRegistry() {
      let registry : MigrationInterface[] = [];
      registry.push(new CreateTableMigration('migration_00001', 'table_test','Name:STRING, Name2:STRING'));
      return registry;
  }
}

export default MigrationRegistry;
