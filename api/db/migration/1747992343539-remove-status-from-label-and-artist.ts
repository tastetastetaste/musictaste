import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStatusFromLabelAndArtist1747992343539 implements MigrationInterface {
    name = 'RemoveStatusFromLabelAndArtist1747992343539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" ADD "status" integer NOT NULL DEFAULT '20'`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "status" integer NOT NULL DEFAULT '20'`);
    }

}
