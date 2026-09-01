import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';
import { ConfigurationVariableKind } from '../../enums/configuration-variable-kind.enum';

const VARIABLE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_.-]*$/;

export class CreateConfigurationVariableRequestApiDto {
  @ApiProperty({ example: 'GoogleAdsCustomerId' })
  @IsString()
  @Length(1, 100)
  @Matches(VARIABLE_NAME_PATTERN, {
    message: 'name must start with a letter and contain only letters, numbers, _, ., or -',
  })
  name: string;

  @ApiProperty({ enum: ConfigurationVariableKind })
  @IsEnum(ConfigurationVariableKind)
  kind: ConfigurationVariableKind;

  @ApiProperty({ required: false, example: '1234567890' })
  @IsOptional()
  value?: string | number | boolean | string[];

  @ApiPropertyOptional({ example: 'Shared Google Ads customer id' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    example: 'CustomerId',
    description: 'Connector field path for a VALUE variable',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  fieldPath?: string;

  @ApiPropertyOptional({ description: 'Existing ConnectorSourceCredentials id' })
  @IsOptional()
  @IsUUID()
  credentialId?: string;
}

export class UpdateConfigurationVariableRequestApiDto {
  @ApiPropertyOptional({ example: 'GoogleAdsCustomerId' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Matches(VARIABLE_NAME_PATTERN)
  name?: string;

  @ApiPropertyOptional({ enum: ConfigurationVariableKind })
  @IsOptional()
  @IsEnum(ConfigurationVariableKind)
  kind?: ConfigurationVariableKind;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  value?: string | number | boolean | string[];

  @ApiPropertyOptional({ example: 'Shared Google Ads customer id' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ example: 'CustomerId' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  fieldPath?: string;

  @ApiPropertyOptional({ description: 'Existing ConnectorSourceCredentials id' })
  @IsOptional()
  @IsUUID()
  credentialId?: string;
}

export class ConfigurationVariableResponseApiDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ConfigurationVariableKind })
  kind: ConfigurationVariableKind;

  @ApiProperty({ required: false })
  value?: string | number | boolean | string[] | null;

  @ApiProperty({ required: false })
  valueType?: string | null;

  @ApiProperty({ required: false })
  connectorName?: string | null;

  @ApiProperty({ required: false })
  fieldPath?: string | null;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  modifiedAt: Date;
}

export class ConfigurationVariableCredentialCandidateResponseApiDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  connectorName: string;

  @ApiProperty({ enum: ['secret_reference', 'credential_reference'] })
  kind: ConfigurationVariableKind.SECRET_REFERENCE | ConfigurationVariableKind.CREDENTIAL_REFERENCE;

  @ApiProperty({
    required: false,
    type: Object,
  })
  identity?: {
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
  } | null;

  @ApiProperty({ required: false })
  expiresAt?: Date | null;

  @ApiProperty({ required: false })
  dataMartId?: string | null;

  @ApiProperty({ required: false })
  configId?: string | null;

  @ApiProperty()
  createdAt: Date;
}
