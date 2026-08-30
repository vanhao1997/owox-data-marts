import { DataStorageType } from '../../model/types';
import { type DataStorageConfig } from '../../model/types';
import { ConfigSection } from './ConfigSection';
import { useTranslation } from 'react-i18next';

interface DataStorageInfoProps {
  type: DataStorageType;
  config?: DataStorageConfig;
}

export const DataStorageInfo = ({ type, config }: DataStorageInfoProps) => {
  const { t } = useTranslation();
  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h4 className='text-sm font-medium'>{t('common.configuration', 'Configuration')}</h4>
        <ConfigSection type={type} config={config} />
      </div>
    </div>
  );
};
