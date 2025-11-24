import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArtistAliasRelation1763961880670 implements MigrationInterface {
    name = 'AddArtistAliasRelation1763961880670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" ADD "mainArtistId" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD CONSTRAINT "FK_180edeb4afe61287996b0913704" FOREIGN KEY ("mainArtistId") REFERENCES "artist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" DROP CONSTRAINT "FK_180edeb4afe61287996b0913704"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "mainArtistId"`);
    }

}
