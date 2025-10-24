import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnaccentExtension1761326533455
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('CREATE EXTENSION IF NOT EXISTS unaccent');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP EXTENSION IF EXISTS unaccent');
  }
}
