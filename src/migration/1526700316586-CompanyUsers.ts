import {MigrationInterface, QueryRunner} from "typeorm";

export class CompanyUsers1526700316586 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `company_user` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `companyId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `company_user` ADD CONSTRAINT `FK_92e4bc953bf0ca4c707f29b0ff8` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `company_user` DROP FOREIGN KEY `FK_92e4bc953bf0ca4c707f29b0ff8`");
        await queryRunner.query("DROP TABLE `company_user`");
    }

}
