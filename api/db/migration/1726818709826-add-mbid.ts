import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMbid1726818709826 implements MigrationInterface {
  name = 'AddMbid1726818709826';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "release" RENAME COLUMN "spotifyId" TO "mbid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist" ADD "mbid" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "label" ADD "mbid" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "mbid"`);
    await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "mbid"`);
    await queryRunner.query(
      `ALTER TABLE "release" RENAME COLUMN "mbid" TO "spotifyId"`,
    );
  }
}
