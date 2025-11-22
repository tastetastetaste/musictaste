import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArtistAliasField1763808318068 implements MigrationInterface {
    name = 'AddArtistAliasField1763808318068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "release_artist" ADD "alias" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "release_artist" DROP COLUMN "alias"`);
    }

}
