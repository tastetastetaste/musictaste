import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourcesFields1763122660443 implements MigrationInterface {
  name = 'AddSourcesFields1763122660443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "list" ADD "descriptionSource" text`);
    await queryRunner.query(`ALTER TABLE "list_item" ADD "noteSource" text`);
    await queryRunner.query(`ALTER TABLE "review" ADD "bodySource" text`);
    await queryRunner.query(`ALTER TABLE "genre" ADD "bioSource" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "bioSource" text`);
    await queryRunner.query(
      `UPDATE "list" SET "descriptionSource" = "description"`,
    );
    await queryRunner.query(`UPDATE "list_item" SET "noteSource" = "note"`);
    await queryRunner.query(`UPDATE "review" SET "bodySource" = "body"`);
    await queryRunner.query(`UPDATE "genre" SET "bioSource" = "bio"`);
    await queryRunner.query(`UPDATE "user" SET "bioSource" = "bio"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bioSource"`);
    await queryRunner.query(`ALTER TABLE "genre" DROP COLUMN "bioSource"`);
    await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "bodySource"`);
    await queryRunner.query(`ALTER TABLE "list_item" DROP COLUMN "noteSource"`);
    await queryRunner.query(
      `ALTER TABLE "list" DROP COLUMN "descriptionSource"`,
    );
  }
}
