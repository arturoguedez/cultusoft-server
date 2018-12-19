import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRolestoCopmanyUser1526934149621 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `company_user_roles_role` (`companyUserId` int NOT NULL, `roleId` int NOT NULL, PRIMARY KEY (`companyUserId`, `roleId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `company_user_roles_role` ADD CONSTRAINT `FK_7f402c50f7720eac08a9bc29958` FOREIGN KEY (`companyUserId`) REFERENCES `company_user`(`id`) ON DELETE CASCADE");
        await queryRunner.query("ALTER TABLE `company_user_roles_role` ADD CONSTRAINT `FK_6b7218933646bdc7f701e7a894c` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `company_user_roles_role` DROP FOREIGN KEY `FK_6b7218933646bdc7f701e7a894c`");
        await queryRunner.query("ALTER TABLE `company_user_roles_role` DROP FOREIGN KEY `FK_7f402c50f7720eac08a9bc29958`");
        await queryRunner.query("DROP TABLE `company_user_roles_role`");
    }

}
