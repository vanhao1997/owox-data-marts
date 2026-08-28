import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('pending_member_invitation_scope')
export class PendingMemberInvitationScope {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  invitationId!: string;

  @Column({ type: 'varchar', length: 255 })
  projectId!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 32 })
  role!: string;

  @Column({ type: 'varchar', length: 32 })
  roleScope!: string;

  @Column({ type: 'text' })
  contextIdsJson!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
