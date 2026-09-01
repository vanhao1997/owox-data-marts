import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateConfigurationVariablesTable1788300000000 implements MigrationInterface {
  name = 'CreateConfigurationVariablesTable1788300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('configuration_variables')) return;

    await queryRunner.createTable(
      new Table({
        name: 'configuration_variables',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'projectId', type: 'varchar', length: '255', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'kind', type: 'varchar', length: '30', isNullable: false },
          { name: 'value', type: 'json', isNullable: true, default: null },
          { name: 'valueType', type: 'varchar', length: '20', isNullable: true, default: null },
          {
            name: 'connectorName',
            type: 'varchar',
            length: '255',
            isNullable: true,
            default: null,
          },
          { name: 'credentialId', type: 'varchar', length: '36', isNullable: true, default: null },
          {
            name: 'sourceDataMartId',
            type: 'varchar',
            length: '36',
            isNullable: true,
            default: null,
          },
          {
            name: 'sourceConfigId',
            type: 'varchar',
            length: '255',
            isNullable: true,
            default: null,
          },
          { name: 'fieldPath', type: 'varchar', length: '255', isNullable: true, default: null },
          { name: 'description', type: 'text', isNullable: true, default: null },
          { name: 'createdById', type: 'varchar', length: '255', isNullable: false },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'modifiedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'deletedAt', type: 'datetime', isNullable: true, default: null },
        ],
      })
    );

    await queryRunner.createIndex(
      'configuration_variables',
      new TableIndex({
        name: 'IDX_configuration_variables_projectId',
        columnNames: ['projectId'],
      })
    );
    await queryRunner.createIndex(
      'configuration_variables',
      new TableIndex({
        name: 'IDX_configuration_variables_projectId_name',
        columnNames: ['projectId', 'name'],
        isUnique: true,
      })
    );
    await queryRunner.createIndex(
      'configuration_variables',
      new TableIndex({
        name: 'IDX_configuration_variables_credentialId',
        columnNames: ['credentialId'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('configuration_variables')) {
      await queryRunner.dropTable('configuration_variables');
    }
  }
}
