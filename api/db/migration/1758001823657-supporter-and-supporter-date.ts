import { MigrationInterface, QueryRunner } from "typeorm";

export class SupporterAndSupporterDate1758001823657 implements MigrationInterface {
    name = 'SupporterAndSupporterDate1758001823657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "supporterStartDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "supporter"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "supporter" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "supporter"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "supporter" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "supporterStartDate"`);
    }

}
