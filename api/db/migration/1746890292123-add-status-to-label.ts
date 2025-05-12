import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToLabel1746890292123 implements MigrationInterface {
    name = 'AddStatusToLabel1746890292123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" ADD "status" integer NOT NULL DEFAULT '20'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "status"`);
    }

}
