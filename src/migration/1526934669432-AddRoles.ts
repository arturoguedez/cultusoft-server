import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoles1526934669432 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('INSERT INTO role (name) VALUES ("company_user"), ("company_manager")');
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.query('DELETE FROM role WHERE name IN ("company_user", "company_manager")');
  }

}
