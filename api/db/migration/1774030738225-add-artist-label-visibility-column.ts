import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArtistLabelVisibilityColumn1774030738225 implements MigrationInterface {
    name = 'AddArtistLabelVisibilityColumn1774030738225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" ADD "visibility" integer NOT NULL DEFAULT '20'`);
        await queryRunner.query(`ALTER TABLE "label" ADD "visibility" integer NOT NULL DEFAULT '20'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "visibility"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "visibility"`);
    }

}
