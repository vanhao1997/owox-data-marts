import { ApiService } from '../../services';
import type {
  ConfigurationVariable,
  CredentialCandidate,
  CreateConfigurationVariableRequest,
  UpdateConfigurationVariableRequest,
} from './types';

class ConfigurationVariablesApiService extends ApiService {
  constructor() {
    super('/configuration-variables');
  }

  list(): Promise<ConfigurationVariable[]> {
    return this.get<ConfigurationVariable[]>('');
  }

  listCandidates(): Promise<CredentialCandidate[]> {
    return this.get<CredentialCandidate[]>('/candidates');
  }

  create(payload: CreateConfigurationVariableRequest): Promise<ConfigurationVariable> {
    return this.post<ConfigurationVariable>('', payload);
  }

  update(id: string, payload: UpdateConfigurationVariableRequest): Promise<ConfigurationVariable> {
    return this.patch<ConfigurationVariable>(`/${id}`, payload);
  }

  remove(id: string): Promise<void> {
    return this.delete(`/${id}`);
  }
}

export const configurationVariablesApi = new ConfigurationVariablesApiService();
