import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddKindToConnectorSourceCredentials1788300000001 implements MigrationInterface {
  name = 'AddKindToConnectorSourceCredentials1788300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('connector_source_credentials', 'kind'))) {
      await queryRunner.addColumn(
        'connector_source_credentials',
        new TableColumn({
          name: 'kind',
          type: 'varchar',
          length: '20',
          isNullable: false,
          default: "'oauth'",
        })
      );
    }
    await queryRunner.query(
      `UPDATE connector_source_credentials SET kind = 'secret' WHERE dataMartId IS NOT NULL OR configId IS NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('connector_source_credentials', 'kind')) {
      await queryRunner.dropColumn('connector_source_credentials', 'kind');
    }
  }
}
