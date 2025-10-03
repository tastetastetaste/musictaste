import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotifications1759502792348 implements MigrationInterface {
    name = 'AddNotifications1759502792348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "notifyId" character varying NOT NULL, "notificationType" integer NOT NULL, "message" text NOT NULL, "link" text, "read" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cf225ba1f3466c18fc7af8a232" ON "notification" ("notifyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ab7d9d4afeea9632744d5ca365" ON "notification" ("notifyId", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_e8d34e793c1fb87c521ab57c91" ON "notification" ("notifyId", "read") `);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_cf225ba1f3466c18fc7af8a2326" FOREIGN KEY ("notifyId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_cf225ba1f3466c18fc7af8a2326"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e8d34e793c1fb87c521ab57c91"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ab7d9d4afeea9632744d5ca365"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf225ba1f3466c18fc7af8a232"`);
        await queryRunner.query(`DROP TABLE "notification"`);
    }

}
