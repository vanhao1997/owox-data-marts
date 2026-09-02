import type { DataDestinationResponseDto } from '../../services/types';
import type { DataDestination } from '../types';
import { DestinationMapperFactory } from './destination-mapper.factory.ts';

export function mapDataDestinationFromDto(dto: DataDestinationResponseDto): DataDestination {
  const mapper = DestinationMapperFactory.getMapper(dto.type);
  return {
    ...mapper.mapFromDto(dto),
    availableForUse: dto.availableForUse,
    availableForMaintenance: dto.availableForMaintenance,
    contexts: dto.contexts ?? [],
  };
}
