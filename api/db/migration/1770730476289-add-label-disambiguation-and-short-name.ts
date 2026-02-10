import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLabelDisambiguationAndShortName1770730476289 implements MigrationInterface {
    name = 'AddLabelDisambiguationAndShortName1770730476289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" ADD "disambiguation" character varying`);
        await queryRunner.query(`ALTER TABLE "label" ADD "shortName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "shortName"`);
        await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "disambiguation"`);
    }

}
