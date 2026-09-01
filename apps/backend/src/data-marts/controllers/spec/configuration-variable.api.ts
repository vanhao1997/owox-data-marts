import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ConfigurationVariableCredentialCandidateResponseApiDto,
  ConfigurationVariableResponseApiDto,
  CreateConfigurationVariableRequestApiDto,
  UpdateConfigurationVariableRequestApiDto,
} from '../../dto/presentation/configuration-variable-api.dto';

export const ListConfigurationVariablesSpec = () =>
  applyDecorators(
    ApiOperation({ summary: 'List reusable project configuration variables' }),
    ApiOkResponse({ type: ConfigurationVariableResponseApiDto, isArray: true })
  );

export const ListConfigurationVariableCandidatesSpec = () =>
  applyDecorators(
    ApiOperation({ summary: 'List reusable connector credential candidates' }),
    ApiOkResponse({ type: ConfigurationVariableCredentialCandidateResponseApiDto, isArray: true })
  );

export const CreateConfigurationVariableSpec = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a reusable project configuration variable' }),
    ApiBody({ type: CreateConfigurationVariableRequestApiDto }),
    ApiCreatedResponse({ type: ConfigurationVariableResponseApiDto }),
    ApiResponse({ status: 400, description: 'Invalid variable or credential reference' })
  );

export const UpdateConfigurationVariableSpec = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a reusable project configuration variable' }),
    ApiParam({ name: 'id' }),
    ApiBody({ type: UpdateConfigurationVariableRequestApiDto }),
    ApiOkResponse({ type: ConfigurationVariableResponseApiDto })
  );

export const DeleteConfigurationVariableSpec = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a reusable project configuration variable' }),
    ApiParam({ name: 'id' }),
    ApiResponse({ status: 204, description: 'Variable deleted' }),
    ApiResponse({ status: 409, description: 'Variable is still referenced by a Data Mart' })
  );
