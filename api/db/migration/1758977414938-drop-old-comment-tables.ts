import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOldCommentTables1758977414938 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "review_comment" DROP CONSTRAINT "FK_3c9d31f6121408a92687a262053"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_comment" DROP CONSTRAINT "FK_48d292fa20615320242c9efb527"`,
    );
    await queryRunner.query(`DROP TABLE "review_comment"`);
    await queryRunner.query(
      `ALTER TABLE "list_comment" DROP CONSTRAINT "FK_1f1eb8e3b0abe67c2c305b8d5e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_comment" DROP CONSTRAINT "FK_7ac82ef2f8c787fcbab3ecd7ad8"`,
    );
    await queryRunner.query(`DROP TABLE "list_comment"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "review_comment" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "reviewId" character varying NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_81a77699383553c51a2d444a8a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_comment" ADD CONSTRAINT "FK_48d292fa20615320242c9efb527" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_comment" ADD CONSTRAINT "FK_3c9d31f6121408a92687a262053" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "list_comment" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "listId" character varying NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ff397b2d24fd99393e57559d0d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_comment" ADD CONSTRAINT "FK_7ac82ef2f8c787fcbab3ecd7ad8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_comment" ADD CONSTRAINT "FK_1f1eb8e3b0abe67c2c305b8d5e7" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
