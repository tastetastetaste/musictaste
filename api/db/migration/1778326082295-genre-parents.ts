import { MigrationInterface, QueryRunner } from "typeorm";

export class GenreParents1778326082295 implements MigrationInterface {
    name = 'GenreParents1778326082295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "genre_parent" ("genreId" character varying NOT NULL, "parentId" character varying NOT NULL, CONSTRAINT "PK_b71ec35da718e7ae4158d7e3f1e" PRIMARY KEY ("genreId", "parentId"))`);
        await queryRunner.query(`ALTER TABLE "genre_parent" ADD CONSTRAINT "FK_3ae853b2e38ddae878a8e657301" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "genre_parent" ADD CONSTRAINT "FK_b211fb75afeaf946c4aa761e28d" FOREIGN KEY ("parentId") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "genre_parent" DROP CONSTRAINT "FK_b211fb75afeaf946c4aa761e28d"`);
        await queryRunner.query(`ALTER TABLE "genre_parent" DROP CONSTRAINT "FK_3ae853b2e38ddae878a8e657301"`);
        await queryRunner.query(`DROP TABLE "genre_parent"`);
    }

}
