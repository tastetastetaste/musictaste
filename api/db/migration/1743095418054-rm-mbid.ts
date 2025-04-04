import { MigrationInterface, QueryRunner } from 'typeorm';

export class RmMbid1743095418054 implements MigrationInterface {
  name = 'RmMbid1743095418054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "artist" DROP COLUMN "mbid"`);
    await queryRunner.query(`ALTER TABLE "label" DROP COLUMN "mbid"`);
    await queryRunner.query(`ALTER TABLE "release" DROP COLUMN "mbid"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "release" ADD "mbid" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "label" ADD "mbid" character varying`);
    await queryRunner.query(
      `ALTER TABLE "artist" ADD "mbid" character varying`,
    );
  }
}
