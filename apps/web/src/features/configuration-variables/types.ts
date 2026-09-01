export type ConfigurationVariableKind = 'value' | 'secret_reference' | 'credential_reference';

export interface ConfigurationVariable {
  id: string;
  projectId: string;
  name: string;
  kind: ConfigurationVariableKind;
  value?: string | number | boolean | string[] | null;
  valueType?: string | null;
  connectorName?: string | null;
  fieldPath?: string | null;
  description?: string | null;
  createdAt: string;
  modifiedAt: string;
}

export interface CredentialCandidate {
  id: string;
  connectorName: string;
  kind: Exclude<ConfigurationVariableKind, 'value'>;
  identity?: { id?: string; name?: string; email?: string; picture?: string } | null;
  expiresAt?: string | null;
  dataMartId?: string | null;
  configId?: string | null;
  createdAt: string;
}

export interface CreateConfigurationVariableRequest {
  name: string;
  kind: ConfigurationVariableKind;
  value?: string | number | boolean | string[];
  description?: string;
  credentialId?: string;
  fieldPath?: string;
}

export type UpdateConfigurationVariableRequest = Partial<
  Omit<CreateConfigurationVariableRequest, 'kind' | 'credentialId'>
>;
