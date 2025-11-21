import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArtistFields1763735536091 implements MigrationInterface {
    name = 'AddArtistFields1763735536091'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" ADD "type" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "disambiguation" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "members" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "membersSource" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "memberOf" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "memberOfSource" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "relatedArtists" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "relatedArtistsSource" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "aka" character varying`);
        await queryRunner.query(`ALTER TABLE "artist" ADD "akaSource" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "akaSource"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "aka"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "relatedArtistsSource"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "relatedArtists"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "memberOfSource"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "memberOf"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "membersSource"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "members"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "disambiguation"`);
        await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "type"`);
    }

}
