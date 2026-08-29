import { Button } from '@owox/ui/components/button';
import { Link } from 'react-router';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function NoAccess() {
  const { t } = useTranslation();

  return (
    <div className='dm-empty-state-404page'>
      <div className='dm-empty-state-404page-foreground'>
        <ShieldAlert className='dm-empty-state-ico' strokeWidth={1} />

        <h1 className='dm-empty-state-title'>{t('noAccessPage.title')}</h1>

        <p className='dm-empty-state-subtitle'>{t('noAccessPage.subtitle')}</p>

        <Button variant='default' asChild>
          <Link
            to={'/'}
            className='flex items-center gap-1'
            aria-label={t('noAccessPage.goDashboard')}
          >
            {t('noAccessPage.goDashboard')}
            <ChevronRight className='h-4 w-4' />
          </Link>
        </Button>
      </div>

      <div className='dm-empty-state-404page-background' />
    </div>
  );
}

export default NoAccess;
