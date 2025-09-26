import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentTable1758877432993 implements MigrationInterface {
  name = 'AddCommentTable1758877432993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" character varying NOT NULL, "body" text NOT NULL, "userId" character varying NOT NULL, "entityId" character varying NOT NULL, "entityType" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b17971c18f48fa609446c3b055" ON "comment" ("entityType", "entityId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO "comment" ("id", "body", "userId", "entityId", "entityType", "createdAt") SELECT "id", "body", "userId", "reviewId", 11, "createdAt" FROM "review_comment";`,
    );
    await queryRunner.query(
      `INSERT INTO "comment" ("id", "body", "userId", "entityId", "entityType", "createdAt") SELECT "id", "body", "userId", "listId", 12, "createdAt" FROM "list_comment";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b17971c18f48fa609446c3b055"`,
    );
    await queryRunner.query(`DROP TABLE "comment"`);
  }
}
