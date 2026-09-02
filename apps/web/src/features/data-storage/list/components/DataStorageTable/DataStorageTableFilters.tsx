import { TableFilters } from '../../../../../shared/components/TableFilters/TableFilters';
import { TableFiltersTrigger } from '../../../../../shared/components/TableFilters/TableFiltersTrigger';
import { TableFiltersContent } from '../../../../../shared/components/TableFilters/TableFiltersContent';
import type { FiltersState } from '../../../../../shared/components/TableFilters/types';
import type { DataStorageFilterKey } from './DataStorageTableFilters.config';
import type { FilterConfigItem } from '../../../../../shared/components/TableFilters/types';

interface DataStorageTableFiltersProps {
  appliedState: FiltersState<DataStorageFilterKey>;
  config: FilterConfigItem<DataStorageFilterKey>[];
  onApply: (state: FiltersState<DataStorageFilterKey>) => void;
  onClear: () => void;
}

export function DataStorageTableFilters({
  appliedState,
  config,
  onApply,
  onClear,
}: DataStorageTableFiltersProps) {
  return (
    <TableFilters appliedState={appliedState} onApply={onApply} onClear={onClear}>
      <TableFiltersTrigger />
      <TableFiltersContent config={config} />
    </TableFilters>
  );
}
