import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConfigurationVariableKind } from '../enums/configuration-variable-kind.enum';

@Entity('configuration_variables')
export class ConfigurationVariable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  projectId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  kind: ConfigurationVariableKind;

  // Only VALUE variables use this column. Reference variables never contain
  // credential payloads; they point at the existing credential store instead.
  @Column({ type: 'json', nullable: true })
  value?: string | number | boolean | string[] | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  valueType?: 'string' | 'number' | 'boolean' | 'string[]' | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  connectorName?: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  credentialId?: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  sourceDataMartId?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceConfigId?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fieldPath?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 255 })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
