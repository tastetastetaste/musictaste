import { MigrationInterface, QueryRunner } from "typeorm";

export class GenreSubmissionVote1757734943902 implements MigrationInterface {
    name = 'GenreSubmissionVote1757734943902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "genre_submission_vote" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "genreSubmissionId" character varying NOT NULL, "type" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c2f9a487234b3b1693ded96740c" UNIQUE ("userId", "genreSubmissionId"), CONSTRAINT "PK_b171d5312ee6b72cbd7120da194" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "genre" ADD "bio" text`);
        await queryRunner.query(`ALTER TABLE "genre_submission" ADD "note" text`);
        await queryRunner.query(`ALTER TABLE "genre_submission_vote" ADD CONSTRAINT "FK_beec486316b465713f9e106c436" FOREIGN KEY ("genreSubmissionId") REFERENCES "genre_submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "genre_submission_vote" ADD CONSTRAINT "FK_192dcb2b04a7c43db3b1f85b8dd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "genre_submission_vote" DROP CONSTRAINT "FK_192dcb2b04a7c43db3b1f85b8dd"`);
        await queryRunner.query(`ALTER TABLE "genre_submission_vote" DROP CONSTRAINT "FK_beec486316b465713f9e106c436"`);
        await queryRunner.query(`ALTER TABLE "genre_submission" DROP COLUMN "note"`);
        await queryRunner.query(`ALTER TABLE "genre" DROP COLUMN "bio"`);
        await queryRunner.query(`DROP TABLE "genre_submission_vote"`);
    }

}
