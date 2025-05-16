import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToArtist1747389980015 implements MigrationInterface {
    name = 'AddStatusToArtist1747389980015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" ADD "status" integer NOT NULL DEFAULT '20'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "status"`);
    }

}
