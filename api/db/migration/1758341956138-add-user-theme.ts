import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTheme1758341956138 implements MigrationInterface {
    name = 'AddUserTheme1758341956138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "theme" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "theme"`);
    }

}
