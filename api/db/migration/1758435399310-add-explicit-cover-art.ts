import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExplicitCoverArt1758435399310 implements MigrationInterface {
    name = 'AddExplicitCoverArt1758435399310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "release" ADD "explicitCoverArt" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "allowExplicitCoverArt" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "allowExplicitCoverArt"`);
        await queryRunner.query(`ALTER TABLE "release" DROP COLUMN "explicitCoverArt"`);
    }

}
