import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  DatabaseZap,
  Network,
  SquareChartGantt,
  FolderTree,
  FilePenLine,
  Route,
  ScanText,
  Layers,
  Table,
  SwatchBook,
  ScanSearch,
  FlaskConical,
  Goal,
  CheckSquare,
  Group,
  Blocks,
  Grid2x2Check,
  ListChecks,
  FileScan,
} from 'lucide-react';

const STEPS = [
  { icon: Sparkles, key: 'initializing' },
  { icon: DatabaseZap, key: 'connecting' },
  { icon: Network, key: 'mapping' },
  { icon: FolderTree, key: 'exploring' },
  { icon: ScanText, key: 'scanning' },
  { icon: SquareChartGantt, key: 'analyzing' },
  { icon: Route, key: 'selecting' },
  { icon: Table, key: 'aggregating' },
  { icon: Layers, key: 'building' },
  { icon: FilePenLine, key: 'finalizing' },
  { icon: SwatchBook, key: 'validating' },
  { icon: ScanSearch, key: 'missing' },
  { icon: FlaskConical, key: 'anomalies' },
  { icon: ListChecks, key: 'crossReferencing' },
  { icon: CheckSquare, key: 'verifying' },
  { icon: Group, key: 'relationships' },
  { icon: Blocks, key: 'refining' },
  { icon: Grid2x2Check, key: 'integrity' },
  { icon: FileScan, key: 'preparing' },
  { icon: Goal, key: 'quality' },
] as const;

export const InsightLoader = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % STEPS.length);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const Icon = STEPS[step].icon;

  return (
    <div className='bg-muted h-full w-full rounded-tr-md rounded-br-md dark:bg-transparent'>
      <div className='flex h-full w-full animate-pulse flex-col items-center justify-center gap-4 p-4 text-center select-none'>
        <div
          key={`${String(step)}-icon`}
          className='text-muted-foreground animate-fade-slide-in-out'
        >
          <Icon className='h-8 w-8' strokeWidth={1} />
        </div>
        <h3
          key={`${String(step)}-text`}
          className='text-muted-foreground animate-fade-slide-in-out text-sm'
        >
          {t(`insightsUi.loader.${STEPS[step].key}`)}
        </h3>
      </div>
    </div>
  );
};
