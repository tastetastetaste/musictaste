import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTrackDurationToBigint1761671985006
  implements MigrationInterface
{
  name = 'ChangeTrackDurationToBigint1761671985006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table "track" alter column "durationMs" type BIGINT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table "track" alter column "durationMs" type INTEGER`,
    );
  }
}
