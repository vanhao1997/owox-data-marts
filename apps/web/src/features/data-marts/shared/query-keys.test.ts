import { describe, expect, it } from 'vitest';
import { dataMartQueryKeys } from './query-keys';

describe('dataMartQueryKeys', () => {
  it('partitions reports and runs by project', () => {
    expect(dataMartQueryKeys.reports('project-a')).not.toEqual(
      dataMartQueryKeys.reports('project-b')
    );
    expect(dataMartQueryKeys.runs('project-a')).not.toEqual(dataMartQueryKeys.runs('project-b'));
  });

  it('uses only project and list state in keys', () => {
    expect(dataMartQueryKeys.all('project-1')).toEqual(['data-marts', 'project-1']);
    expect(dataMartQueryKeys.reports('project-1', { page: 2 })).toEqual([
      'reports',
      'project-1',
      { page: 2 },
    ]);
    expect(dataMartQueryKeys.storages('project-1')).toEqual(['data-storages', 'project-1', {}]);
    expect(dataMartQueryKeys.destinations('project-1')).toEqual([
      'data-destinations',
      'project-1',
      {},
    ]);
  });

  it('provides project-scoped roots for invalidating every list variant', () => {
    expect(dataMartQueryKeys.runsRoot('project-1')).toEqual(['data-mart-runs', 'project-1']);
    expect(dataMartQueryKeys.reportsRoot('project-1')).toEqual(['reports', 'project-1']);
    expect(dataMartQueryKeys.storagesRoot('project-1')).toEqual(['data-storages', 'project-1']);
    expect(dataMartQueryKeys.storageRoot('project-1')).toEqual(['data-storage', 'project-1']);
    expect(dataMartQueryKeys.destinationsRoot('project-1')).toEqual([
      'data-destinations',
      'project-1',
    ]);
    expect(dataMartQueryKeys.destinationRoot('project-1')).toEqual([
      'data-destination',
      'project-1',
    ]);
  });
});
