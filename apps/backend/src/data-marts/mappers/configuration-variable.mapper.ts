import { Injectable } from '@nestjs/common';
import { ConfigurationVariable } from '../entities/configuration-variable.entity';
import {
  ConfigurationVariableCredentialCandidateResponseApiDto,
  ConfigurationVariableResponseApiDto,
} from '../dto/presentation/configuration-variable-api.dto';
import { ConfigurationVariableKind } from '../enums/configuration-variable-kind.enum';

@Injectable()
export class ConfigurationVariableMapper {
  toResponse(entity: ConfigurationVariable): ConfigurationVariableResponseApiDto {
    return {
      id: entity.id,
      projectId: entity.projectId,
      name: entity.name,
      kind: entity.kind,
      value: entity.kind === ConfigurationVariableKind.VALUE ? entity.value : undefined,
      valueType: entity.valueType,
      connectorName: entity.connectorName,
      fieldPath: entity.fieldPath,
      description: entity.description,
      createdAt: entity.createdAt,
      modifiedAt: entity.modifiedAt,
    };
  }

  toResponseList(entities: ConfigurationVariable[]): ConfigurationVariableResponseApiDto[] {
    return entities.map(entity => this.toResponse(entity));
  }

  toCandidateResponse(candidate: {
    id: string;
    connectorName: string;
    kind:
      | ConfigurationVariableKind.SECRET_REFERENCE
      | ConfigurationVariableKind.CREDENTIAL_REFERENCE;
    identity?: { id?: string; name?: string; email?: string; picture?: string } | null;
    expiresAt?: Date | null;
    createdAt: Date;
    dataMartId?: string | null;
    configId?: string | null;
  }): ConfigurationVariableCredentialCandidateResponseApiDto {
    return {
      id: candidate.id,
      connectorName: candidate.connectorName,
      kind: candidate.kind,
      identity: candidate.identity,
      expiresAt: candidate.expiresAt,
      dataMartId: candidate.dataMartId,
      configId: candidate.configId,
      createdAt: candidate.createdAt,
    };
  }
}
