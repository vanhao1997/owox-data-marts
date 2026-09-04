import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
// @ts-expect-error - Package lacks TypeScript declarations
import { Connectors, Core } from '@owox/connectors';
import { ConnectorFieldsSchema } from '../../connector-types/connector-fields-schema';
import { AuthorizationContext } from '../../../idp';
import { ConnectorPreviewCredentialsService } from './connector-preview-credentials.service';
import { ConnectorService } from './connector.service';
import {
  mapConnectorFieldsSchema,
  type SourceFieldsSchema,
} from './connector-fields-schema.mapper';

const PREVIEW_TIMEOUT_MS = 15_000;
const ADMICRO_PREVIEW_TIMEOUT_MS = 130_000;

class PreviewTimeoutError extends Error {}

class ConnectorFieldsPreviewConfig extends Core.AbstractConfig {
  private readonly logger: Logger;

  constructor(configData: Record<string, unknown>, logger: Logger) {
    super(configData);
    this.logger = logger;
  }

  handleStatusUpdate(): void {}

  updateLastImportDate(): void {}

  updateLastRequstedDate(): void {}

  isInProgress(): boolean {
    return false;
  }

  addWarningToCurrentStatus(): void {}

  logMessage(message: string): void {
    this.logger.debug(message);
  }
}

@Injectable()
export class ConnectorFieldsPreviewService {
  private readonly logger = new Logger(ConnectorFieldsPreviewService.name);

  constructor(
    private readonly previewCredentials: ConnectorPreviewCredentialsService,
    private readonly connectorService: ConnectorService
  ) {}

  async run(
    context: AuthorizationContext,
    connectorName: string,
    configuration: Record<string, unknown>
  ): Promise<ConnectorFieldsSchema> {
    this.connectorService.getConnectorCapabilities(connectorName);
    const SourceClass = Connectors[connectorName]?.[`${connectorName}Source`];
    if (typeof SourceClass?.prototype?.fetchFieldsSchema !== 'function') {
      throw new BadRequestException(
        `Connector '${connectorName}' does not support dynamic field preview`
      );
    }

    let configWithCredentials: Record<string, unknown>;
    try {
      configWithCredentials = await this.previewCredentials.inject(
        connectorName,
        configuration,
        context
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to resolve credentials for ${connectorName} field preview`, error);
      throw new InternalServerErrorException('Unable to resolve credentials for field preview');
    }

    const source = this.createSource(connectorName, configWithCredentials);

    try {
      source.config.validate();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException({ message });
    }

    try {
      const timeoutMs =
        connectorName === 'AdmicroAds' ? ADMICRO_PREVIEW_TIMEOUT_MS : PREVIEW_TIMEOUT_MS;
      const sourceFieldsSchema = (await this.withTimeout(
        signal => source.fetchFieldsSchema(signal),
        timeoutMs
      )) as SourceFieldsSchema;
      return ConnectorFieldsSchema.parse(mapConnectorFieldsSchema(sourceFieldsSchema));
    } catch (error) {
      throw this.mapPreviewError(error, connectorName);
    }
  }

  private createSource(connectorName: string, configuration: Record<string, unknown>) {
    const SourceClass = Connectors[connectorName][`${connectorName}Source`];
    const sourceConfig = new Core.SourceConfigDto({
      name: connectorName,
      config: configuration,
    });

    return new SourceClass(new ConnectorFieldsPreviewConfig(sourceConfig.config, this.logger));
  }

  private async withTimeout<T>(
    work: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const abortController = new AbortController();
    let timeout: NodeJS.Timeout | undefined;
    const deadline = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(() => {
        abortController.abort();
        reject(new PreviewTimeoutError('Connector field preview timed out'));
      }, timeoutMs);
    });

    try {
      return await Promise.race([work(abortController.signal), deadline]);
    } catch (error) {
      if (abortController.signal.aborted) {
        throw new PreviewTimeoutError('Connector field preview timed out');
      }
      throw error;
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  private mapPreviewError(error: unknown, connectorName?: string): HttpException {
    if (error instanceof HttpException) {
      return error;
    }
    if (error instanceof PreviewTimeoutError) {
      return new GatewayTimeoutException('Connector field preview timed out');
    }

    const status = this.extractProviderStatus(error);
    const message = error instanceof Error ? error.message : String(error);
    const normalizedMessage = message.toLowerCase();

    if (
      connectorName === 'AdmicroAds' &&
      this.looksLikeExtractorAuthenticationFailure(normalizedMessage)
    ) {
      return new BadGatewayException('Admicro extractor authentication failed');
    }
    if (status === 401 || this.looksLikeAuthenticationFailure(normalizedMessage)) {
      // The application client reserves HTTP 401 for the OWOX login session.
      return new BadRequestException('Connector credentials are invalid or expired');
    }
    if (status === 403) {
      return new ForbiddenException(message);
    }
    if (
      status === 400 ||
      status === 404 ||
      this.isConnectorConfigurationError(error) ||
      this.looksLikeConfigurationFailure(normalizedMessage)
    ) {
      return new BadRequestException({ message });
    }
    if (
      status === 429 ||
      (status !== undefined && status >= 500) ||
      this.isProviderRequestError(error)
    ) {
      return new BadGatewayException('Connector provider is temporarily unavailable');
    }

    this.logger.error('Unexpected connector field preview failure', error);
    return new InternalServerErrorException('Unable to preview connector fields');
  }

  private extractProviderStatus(error: unknown): number | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const record = error as Record<string, unknown>;
    for (const value of [record.statusCode, record.status]) {
      if (typeof value === 'number') {
        return value;
      }
    }

    if (record.response && typeof record.response === 'object') {
      const responseStatus = (record.response as Record<string, unknown>).status;
      if (typeof responseStatus === 'number') {
        return responseStatus;
      }
    }

    return this.extractProviderStatus(record.cause);
  }

  private isProviderRequestError(error: unknown): boolean {
    return error instanceof Error && error.name === 'HttpRequestException';
  }

  private isConnectorConfigurationError(error: unknown): boolean {
    if (error instanceof Core.ConnectorConfigurationException) {
      return true;
    }
    if (!error || typeof error !== 'object') {
      return false;
    }
    return this.isConnectorConfigurationError((error as Record<string, unknown>).cause);
  }

  private looksLikeAuthenticationFailure(message: string): boolean {
    return [
      'access token',
      'authentication failed',
      'credentials were rejected',
      'failed to get access token',
      'invalid credential',
      'invalid_grant',
      'token error',
    ].some(fragment => message.includes(fragment));
  }

  private looksLikeExtractorAuthenticationFailure(message: string): boolean {
    return [
      'extractor signature',
      'extractor body hash',
      'extractor nonce',
      'extractor timestamp',
      'extractor shared secret',
    ].some(fragment => message.includes(fragment));
  }

  private looksLikeConfigurationFailure(message: string): boolean {
    return [
      'no headers found',
      'no columns selected',
      'header row',
      'spreadsheet not found',
      'sheet not found',
      'unsupported google sheets authentication type',
    ].some(fragment => message.includes(fragment));
  }
}
