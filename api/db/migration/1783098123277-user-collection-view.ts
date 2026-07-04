import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCollectionView1783098123277 implements MigrationInterface {
    name = 'UserCollectionView1783098123277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_collection_view" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "title" character varying NOT NULL, "order" integer NOT NULL, "filters" text NOT NULL, CONSTRAINT "PK_18ee40756dbdc35d66a0d7ea984" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_collection_view" ADD CONSTRAINT "FK_7f56edc0fb8be3849d3e81e8b08" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_collection_view" DROP CONSTRAINT "FK_7f56edc0fb8be3849d3e81e8b08"`);
        await queryRunner.query(`DROP TABLE "user_collection_view"`);
    }

}
