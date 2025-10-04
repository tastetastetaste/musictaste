import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLatinToLabel1759569308654 implements MigrationInterface {
    name = 'AddLatinToLabel1759569308654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" ADD "nameLatin" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "nameLatin"`);
    }

}
