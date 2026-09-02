export interface GoogleBigQueryCredentials {
  serviceAccount: string; // JSON string containing service account details
  credentialId?: string | null; // ID of linked OAuth credential; null = explicitly disconnected
}

export interface AwsAthenaCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export enum SnowflakeAuthMethod {
  PASSWORD = 'PASSWORD',
  KEY_PAIR = 'KEY_PAIR',
}

export interface SnowflakePasswordCredentials {
  authMethod: SnowflakeAuthMethod.PASSWORD;
  username: string;
  password: string;
}

export interface SnowflakeKeyPairCredentials {
  authMethod: SnowflakeAuthMethod.KEY_PAIR;
  username: string;
  privateKey: string;
  privateKeyPassphrase?: string;
}

export type SnowflakeCredentials = SnowflakePasswordCredentials | SnowflakeKeyPairCredentials;

export enum RedshiftConnectionType {
  SERVERLESS = 'SERVERLESS',
  PROVISIONED = 'PROVISIONED',
}

export interface RedshiftCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export enum DatabricksAuthMethod {
  PERSONAL_ACCESS_TOKEN = 'PERSONAL_ACCESS_TOKEN',
}

export interface DatabricksCredentials {
  authMethod: DatabricksAuthMethod.PERSONAL_ACCESS_TOKEN;
  token: string;
}

export type DataStorageCredentials =
  | GoogleBigQueryCredentials
  | AwsAthenaCredentials
  | SnowflakeCredentials
  | RedshiftCredentials
  | DatabricksCredentials;
