import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGroupsAndRelatedArtistsRelations1765641040117 implements MigrationInterface {
    name = 'AddGroupsAndRelatedArtistsRelations1765641040117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "group_artist" ("groupId" character varying NOT NULL, "artistId" character varying NOT NULL, "current" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_45ce5acded55183e756b7a3a4a0" PRIMARY KEY ("groupId", "artistId"))`);
        await queryRunner.query(`CREATE TABLE "related_artist" ("sourceId" character varying NOT NULL, "targetId" character varying NOT NULL, CONSTRAINT "PK_52002094dbd0da2cafc342f9774" PRIMARY KEY ("sourceId", "targetId"))`);
        await queryRunner.query(`ALTER TABLE "group_artist" ADD CONSTRAINT "FK_4596f354c3fffffdd3b3a8c964d" FOREIGN KEY ("groupId") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_artist" ADD CONSTRAINT "FK_e684994029420d0f9f1b0c125b7" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "related_artist" ADD CONSTRAINT "FK_f79e91f01198c8e05af28f59265" FOREIGN KEY ("sourceId") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "related_artist" ADD CONSTRAINT "FK_e80ba16a4b6b611587299d99e1d" FOREIGN KEY ("targetId") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "related_artist" DROP CONSTRAINT "FK_e80ba16a4b6b611587299d99e1d"`);
        await queryRunner.query(`ALTER TABLE "related_artist" DROP CONSTRAINT "FK_f79e91f01198c8e05af28f59265"`);
        await queryRunner.query(`ALTER TABLE "group_artist" DROP CONSTRAINT "FK_e684994029420d0f9f1b0c125b7"`);
        await queryRunner.query(`ALTER TABLE "group_artist" DROP CONSTRAINT "FK_4596f354c3fffffdd3b3a8c964d"`);
        await queryRunner.query(`DROP TABLE "related_artist"`);
        await queryRunner.query(`DROP TABLE "group_artist"`);
    }

}
