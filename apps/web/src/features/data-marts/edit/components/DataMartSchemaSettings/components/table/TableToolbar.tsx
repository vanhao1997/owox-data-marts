import { Tooltip, TooltipContent, TooltipTrigger } from '@owox/ui/components/tooltip';
import { FunctionSquare, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@owox/ui/components/button';
import { SearchInput } from '@owox/ui/components/common/search-input';
import type { Table } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import type { BaseSchemaField } from '../../../../../shared/types/data-mart-schema.types';
import { DataMartSchemaFieldStatus } from '../../../../../shared/types/data-mart-schema.types';
import { SchemaFieldStatusIcon } from '../fields';
import type { SchemaToolbar } from '../../types/schema-toolbar';
import { useTranslation } from 'react-i18next';

/**
 * Props for the TableToolbar component
 */
interface TableToolbarProps<TData extends BaseSchemaField> {
  /** The table instance */
  table: Table<TData>;
  /** Unique identifier for the search input */
  searchInputId: string;
  /** Callback function to call when the add field button is clicked */
  onAddField: () => void;
  /** Callback for the second toolbar action, beside Add Field. Omit to hide it. */
  onAddCalculatedField?: () => void;
  /** Current filter value */
  filterValue: string;
  /** Callback function to call when the filter value changes */
  onFilterChange: (value: string) => void;
  /** Optional counts of fields by status */
  statusCounts?: Record<DataMartSchemaFieldStatus, number>;
  /** Whether the add field button should be disabled */
  disabled?: boolean;
  /** Additional schema toolbar actions. */
  schemaToolbar: SchemaToolbar;
}

/**
 * Table toolbar component containing search, status counts, and add button
 * Provides controls for filtering and adding new fields to the table
 */
export function TableToolbar<TData extends BaseSchemaField>({
  searchInputId,
  onAddField,
  onAddCalculatedField,
  filterValue,
  onFilterChange,
  statusCounts,
  disabled = false,
  schemaToolbar,
}: TableToolbarProps<TData>) {
  const { t } = useTranslation();
  return (
    <div className='mb-4 flex items-center justify-between gap-2 last:mb-0'>
      <div className='flex grow items-center gap-2'>
        <SearchInput
          id={searchInputId}
          placeholder={t('schemaSettings.searchFields')}
          value={filterValue}
          onChange={onFilterChange}
          className='border-muted dark:border-muted/50 w-full min-w-0 rounded-md border bg-white pl-8 text-sm dark:bg-white/4 dark:hover:bg-white/8'
          aria-label={t('schemaSettings.searchFields')}
        />
      </div>
      <div className='flex flex-shrink-0 items-center gap-2'>
        {statusCounts && (
          <div className='mr-3 flex items-center gap-4 border-r pr-4'>
            {Object.entries(statusCounts).map(([status, count]) => {
              if (count === 0) return null;
              return (
                <div key={status} className='flex items-center gap-1'>
                  <SchemaFieldStatusIcon status={status as DataMartSchemaFieldStatus} />
                  <span className='text-sm font-medium text-gray-500'>{count}</span>
                </div>
              );
            })}
          </div>
        )}
        {schemaToolbar.showAiHelper && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='outline'
                disabled={schemaToolbar.ai.disabled}
                onClick={schemaToolbar.ai.onGenerateMetadata}
                aria-label={t('schemaSettings.generateMetadata')}
              >
                {schemaToolbar.ai.loading.metadata ? (
                  <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
                ) : (
                  <Sparkles className='h-4 w-4' aria-hidden='true' />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('schemaSettings.generateMetadata')}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              onClick={schemaToolbar.refresh.onClick}
              disabled={schemaToolbar.refresh.disabled}
            >
              <RefreshCw className='h-4 w-4' aria-hidden='true' />
              <span className='hidden 2xl:inline'>{t('schemaSettings.refreshSchema')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('schemaSettings.refreshSchema')}</TooltipContent>
        </Tooltip>

        {onAddCalculatedField && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='outline'
                onClick={onAddCalculatedField}
                disabled={disabled}
                aria-label={t('schemaSettings.addCalculatedField')}
              >
                <FunctionSquare className='h-4 w-4' aria-hidden='true' />
                <span className='hidden 2xl:inline'>{t('schemaSettings.addCalculatedField')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('schemaSettings.addCalculatedField')}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              onClick={onAddField}
              disabled={disabled}
              aria-label={t('schemaSettings.addField')}
            >
              <Plus className='h-4 w-4' aria-hidden='true' />
              <span className='hidden 2xl:inline'>{t('schemaSettings.addField')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('schemaSettings.addField')}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
