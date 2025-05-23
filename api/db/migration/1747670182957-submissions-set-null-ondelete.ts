import { MigrationInterface, QueryRunner } from "typeorm";

export class SubmissionsSetNullOndelete1747670182957 implements MigrationInterface {
    name = 'SubmissionsSetNullOndelete1747670182957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "label_submission" DROP CONSTRAINT "FK_1df831a724ba4c72f891bb9cd10"`);
        await queryRunner.query(`ALTER TABLE "release_submission" DROP CONSTRAINT "FK_ae38778f59c0a95b6902f22f4dd"`);
        await queryRunner.query(`ALTER TABLE "artist_submission" DROP CONSTRAINT "FK_2e98c208216dfb7701f89aa335d"`);
        await queryRunner.query(`ALTER TABLE "label_submission" ADD CONSTRAINT "FK_1df831a724ba4c72f891bb9cd10" FOREIGN KEY ("labelId") REFERENCES "label"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "release_submission" ADD CONSTRAINT "FK_ae38778f59c0a95b6902f22f4dd" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artist_submission" ADD CONSTRAINT "FK_2e98c208216dfb7701f89aa335d" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artist_submission" DROP CONSTRAINT "FK_2e98c208216dfb7701f89aa335d"`);
        await queryRunner.query(`ALTER TABLE "release_submission" DROP CONSTRAINT "FK_ae38778f59c0a95b6902f22f4dd"`);
        await queryRunner.query(`ALTER TABLE "label_submission" DROP CONSTRAINT "FK_1df831a724ba4c72f891bb9cd10"`);
        await queryRunner.query(`ALTER TABLE "artist_submission" ADD CONSTRAINT "FK_2e98c208216dfb7701f89aa335d" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "release_submission" ADD CONSTRAINT "FK_ae38778f59c0a95b6902f22f4dd" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "label_submission" ADD CONSTRAINT "FK_1df831a724ba4c72f891bb9cd10" FOREIGN KEY ("labelId") REFERENCES "label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
