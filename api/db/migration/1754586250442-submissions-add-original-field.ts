import { MigrationInterface, QueryRunner } from "typeorm";

export class SubmissionsAddOriginalField1754586250442 implements MigrationInterface {
    name = 'SubmissionsAddOriginalField1754586250442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label_submission" ADD "original" text`);
        await queryRunner.query(`ALTER TABLE "release_submission" ADD "original" text`);
        await queryRunner.query(`ALTER TABLE "genre_submission" ADD "original" text`);
        await queryRunner.query(`ALTER TABLE "artist_submission" ADD "original" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist_submission" DROP COLUMN "original"`);
        await queryRunner.query(`ALTER TABLE "genre_submission" DROP COLUMN "original"`);
        await queryRunner.query(`ALTER TABLE "release_submission" DROP COLUMN "original"`);
        await queryRunner.query(`ALTER TABLE "label_submission" DROP COLUMN "original"`);
    }

}
