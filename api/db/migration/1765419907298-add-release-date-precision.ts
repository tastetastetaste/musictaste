import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReleaseDatePrecision1765419907298 implements MigrationInterface {
    name = 'AddReleaseDatePrecision1765419907298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "release" ADD "datePrecision" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "release" DROP COLUMN "datePrecision"`);
    }

}
