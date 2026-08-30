import { useMemo, type ReactNode } from 'react';
import { SearchInput } from '@owox/ui/components/common/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@owox/ui/components/select';
import { Combobox } from '../../../../shared/components/Combobox/combobox';
import type { DataStorageListItem } from '../../../data-storage/shared/model/types/data-storage-list';
import { DataStorageTypeModel } from '../../../data-storage/shared/types/data-storage-type.model';
import type { CanvasRelFilter, CanvasStatusFilter } from '../model/graph/filter-canvas-data';
import { useTranslation } from 'react-i18next';

interface ModelCanvasToolbarProps {
  storages: DataStorageListItem[];
  storageId: string | null;
  onStorageChange: (id: string) => void;
  status: CanvasStatusFilter;
  onStatusChange: (status: CanvasStatusFilter) => void;
  rel: CanvasRelFilter;
  onRelChange: (rel: CanvasRelFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** The Actions menu — rendered at the row start, mirroring the list page. */
  actions?: ReactNode;
}

export function ModelCanvasToolbar(props: ModelCanvasToolbarProps) {
  const { t } = useTranslation();
  const { storageOptions, storageIcons } = useMemo(() => {
    const sorted = [...props.storages].sort((a, b) => a.title.localeCompare(b.title));
    return {
      storageOptions: sorted.map(storage => ({ value: storage.id, label: storage.title })),
      storageIcons: new Map(
        sorted.map(storage => [storage.id, DataStorageTypeModel.getInfo(storage.type).icon])
      ),
    };
  }, [props.storages]);

  return (
    <div className='flex min-w-0 flex-nowrap items-center gap-2 pb-4'>
      {props.actions}
      <label className='contents' aria-label={t('modelCanvasPage.selectStorage')}>
        <Combobox
          options={storageOptions}
          value={props.storageId ?? ''}
          onValueChange={props.onStorageChange}
          placeholder={t('modelCanvasPage.selectStorage')}
          emptyMessage={t('modelCanvasPage.noStoragesFound')}
          aria-label={t('modelCanvasPage.storageLabel')}
          className='w-[300px] min-w-[220px] shrink'
          renderLabel={option => {
            const Icon = storageIcons.get(option.value);
            return (
              <div className='flex min-w-0 flex-1 items-center gap-2'>
                {Icon && <Icon size={16} className='shrink-0' />}
                <span className='min-w-0 truncate'>{option.label}</span>
              </div>
            );
          }}
        />
      </label>
      <Select
        value={props.status}
        onValueChange={value => {
          props.onStatusChange(value as CanvasStatusFilter);
        }}
      >
        <SelectTrigger className='w-[180px] min-w-[150px]' aria-label={t('modelCanvasPage.status')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='published'>{t('modelCanvasPage.publishedOnly')}</SelectItem>
          <SelectItem value='draft'>{t('modelCanvasPage.draftOnly')}</SelectItem>
          <SelectItem value='all'>{t('modelCanvasPage.allStatuses')}</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={props.rel}
        onValueChange={value => {
          props.onRelChange(value as CanvasRelFilter);
        }}
      >
        <SelectTrigger
          className='w-[220px] min-w-[180px]'
          aria-label={t('modelCanvasPage.relationships')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='connected'>{t('modelCanvasPage.withRelationshipsOnly')}</SelectItem>
          <SelectItem value='all'>{t('modelCanvasPage.allDataMarts')}</SelectItem>
        </SelectContent>
      </Select>
      <div className='ml-auto w-[240px] min-w-[180px] shrink [&>div]:w-full'>
        <SearchInput
          id='model-canvas-search'
          placeholder={t('modelCanvasPage.searchDataMarts')}
          value={props.searchQuery}
          onChange={props.onSearchChange}
          aria-label={t('modelCanvasPage.searchLabel')}
        />
      </div>
    </div>
  );
}
