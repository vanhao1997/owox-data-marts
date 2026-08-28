import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePendingMemberInvitationScope1787000000000 implements MigrationInterface {
  name = 'CreatePendingMemberInvitationScope1787000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('pending_member_invitation_scope')) return;
    await queryRunner.createTable(
      new Table({
        name: 'pending_member_invitation_scope',
        columns: [
          { name: 'invitationId', type: 'varchar', length: '255', isPrimary: true },
          { name: 'projectId', type: 'varchar', length: '255' },
          { name: 'email', type: 'varchar', length: '255' },
          { name: 'role', type: 'varchar', length: '32' },
          { name: 'roleScope', type: 'varchar', length: '32' },
          { name: 'contextIdsJson', type: 'text' },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      'pending_member_invitation_scope',
      new TableIndex({
        name: 'IDX_pending_member_invitation_scope_project',
        columnNames: ['projectId'],
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('pending_member_invitation_scope'))
      await queryRunner.dropTable('pending_member_invitation_scope');
  }
}
