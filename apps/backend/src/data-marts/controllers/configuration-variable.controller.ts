import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, AuthContext, AuthorizationContext, Role, Strategy } from '../../idp';
import {
  ConfigurationVariableResponseApiDto,
  ConfigurationVariableCredentialCandidateResponseApiDto,
  CreateConfigurationVariableRequestApiDto,
  UpdateConfigurationVariableRequestApiDto,
} from '../dto/presentation/configuration-variable-api.dto';
import { ConfigurationVariableMapper } from '../mappers/configuration-variable.mapper';
import { ConfigurationVariableService } from '../services/configuration-variable.service';
import {
  CreateConfigurationVariableSpec,
  DeleteConfigurationVariableSpec,
  ListConfigurationVariableCandidatesSpec,
  ListConfigurationVariablesSpec,
  UpdateConfigurationVariableSpec,
} from './spec/configuration-variable.api';

@Controller('configuration-variables')
@ApiTags('Configuration Variables')
export class ConfigurationVariableController {
  constructor(
    private readonly service: ConfigurationVariableService,
    private readonly mapper: ConfigurationVariableMapper
  ) {}

  @Auth(Role.viewer(Strategy.PARSE))
  @Get()
  @ListConfigurationVariablesSpec()
  async list(
    @AuthContext() context: AuthorizationContext
  ): Promise<ConfigurationVariableResponseApiDto[]> {
    return this.mapper.toResponseList(await this.service.list(context.projectId));
  }

  @Auth(Role.viewer(Strategy.PARSE))
  @Get('candidates')
  @ListConfigurationVariableCandidatesSpec()
  async candidates(
    @AuthContext() context: AuthorizationContext
  ): Promise<ConfigurationVariableCredentialCandidateResponseApiDto[]> {
    return (
      await this.service.listCredentialCandidates(
        context.projectId,
        context.userId,
        context.roles ?? []
      )
    ).map(candidate => this.mapper.toCandidateResponse(candidate));
  }

  @Auth(Role.admin(Strategy.INTROSPECT))
  @Post()
  @CreateConfigurationVariableSpec()
  async create(
    @AuthContext() context: AuthorizationContext,
    @Body() dto: CreateConfigurationVariableRequestApiDto
  ): Promise<ConfigurationVariableResponseApiDto> {
    const entity = await this.service.create(
      context.projectId,
      context.userId,
      dto,
      context.roles ?? []
    );
    return this.mapper.toResponse(entity);
  }

  @Auth(Role.admin(Strategy.INTROSPECT))
  @Patch(':id')
  @UpdateConfigurationVariableSpec()
  async update(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string,
    @Body() dto: UpdateConfigurationVariableRequestApiDto
  ): Promise<ConfigurationVariableResponseApiDto> {
    const entity = await this.service.update(context.projectId, id, dto);
    return this.mapper.toResponse(entity);
  }

  @Auth(Role.admin(Strategy.INTROSPECT))
  @Delete(':id')
  @HttpCode(204)
  @DeleteConfigurationVariableSpec()
  async remove(
    @AuthContext() context: AuthorizationContext,
    @Param('id') id: string
  ): Promise<void> {
    await this.service.remove(context.projectId, id);
  }
}
