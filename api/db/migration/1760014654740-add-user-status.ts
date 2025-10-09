import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserStatus1760014654740 implements MigrationInterface {
  name = 'AddUserStatus1760014654740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "accountStatus" integer NOT NULL DEFAULT '10'`,
    );
    await queryRunner.query(
      `update "user" set "accountStatus" = 20 where "confirmed" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "accountStatus"`);
  }
}
