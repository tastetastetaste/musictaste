import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueConstraintSubmissionsVote1757472214755 implements MigrationInterface {
    name = 'UniqueConstraintSubmissionsVote1757472214755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label_submission_vote" ADD CONSTRAINT "UQ_bdbdb165dddfdf370a6d9e33453" UNIQUE ("userId", "labelSubmissionId")`);
        await queryRunner.query(`ALTER TABLE "release_submission_vote" ADD CONSTRAINT "UQ_b0813c7a21be37f4a6c31654649" UNIQUE ("userId", "releaseSubmissionId")`);
        await queryRunner.query(`ALTER TABLE "artist_submission_vote" ADD CONSTRAINT "UQ_e5b1cf12650bf882a9480ddc0c1" UNIQUE ("userId", "artistSubmissionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist_submission_vote" DROP CONSTRAINT "UQ_e5b1cf12650bf882a9480ddc0c1"`);
        await queryRunner.query(`ALTER TABLE "release_submission_vote" DROP CONSTRAINT "UQ_b0813c7a21be37f4a6c31654649"`);
        await queryRunner.query(`ALTER TABLE "label_submission_vote" DROP CONSTRAINT "UQ_bdbdb165dddfdf370a6d9e33453"`);
    }

}
