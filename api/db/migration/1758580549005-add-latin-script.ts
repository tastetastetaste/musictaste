import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLatinScript1758580549005 implements MigrationInterface {
    name = 'AddLatinScript1758580549005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" ADD "nameLatin" character varying`);
        await queryRunner.query(`ALTER TABLE "release" ADD "titleLatin" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "release" DROP COLUMN "titleLatin"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "nameLatin"`);
    }

}
