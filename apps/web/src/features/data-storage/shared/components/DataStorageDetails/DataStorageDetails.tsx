import { Badge } from '@owox/ui/components/badge';
import { Skeleton } from '@owox/ui/components/skeleton';
import { type DataStorage } from '../../model/types/data-storage';
import { DataStorageTypeModel } from '../../types/data-storage-type.model';
import { DataStorageInfo } from '../DataStorageInfo';
import { useTranslation } from 'react-i18next';

export interface DataStorageDetailsProps {
  dataStorage?: DataStorage | null;
  isLoading?: boolean;
}

export function DataStorageDetails({ dataStorage, isLoading = false }: DataStorageDetailsProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4'>
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className='space-y-1'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-6 w-40' />
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (!dataStorage) {
    return <div>{t('dataStorageDetails.notAvailable')}</div>;
  }

  const { type, config, createdAt, modifiedAt } = dataStorage;

  return (
    <div className='space-y-2'>
      <div className='grid gap-2'>
        <div className='flex items-center justify-between'>
          <div>{dataStorage.title}</div>
          <Badge variant={'secondary'} className='flex h-7 items-center gap-2'>
            {(() => {
              const { displayName, icon: Icon } = DataStorageTypeModel.getInfo(type);
              return (
                <>
                  <Icon />
                  {displayName}
                </>
              );
            })()}
          </Badge>
        </div>

        <div className='bg-muted/10 rounded-md border p-4'>
          <DataStorageInfo type={type} config={config} />
        </div>

        <div className='text-muted-foreground flex gap-6 text-xs'>
          <div>
            <span className='font-medium'>{t('common.createdAt')}:</span>{' '}
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(createdAt))}
          </div>
          <div>
            <span className='font-medium'>{t('dataStorageDetails.modified')}:</span>{' '}
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(modifiedAt))}
          </div>
        </div>
      </div>
    </div>
  );
}
