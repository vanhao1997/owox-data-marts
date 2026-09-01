import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { dataMartDetailsRoutes } from './routes';
import { InsightsV2Redirect } from './InsightsV2Redirect';

function LocationProbe() {
  return <div>{useLocation().pathname}</div>;
}

function renderAlias(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/ui/:projectId/data-marts/:id' element={<Outlet />}>
          <Route path='insights-v2' element={<InsightsV2Redirect />} />
          <Route path='insights-v2/:insightId' element={<InsightsV2Redirect />} />
          <Route path='insights' element={<LocationProbe />} />
          <Route path='insights/:insightId' element={<LocationProbe />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Data Mart insight routes', () => {
  it('keeps V2 on the canonical route and exposes a legacy route', () => {
    const canonical = dataMartDetailsRoutes.find(route => route.path === 'insights');
    const legacy = dataMartDetailsRoutes.find(route => route.path === 'insights-legacy');

    expect(canonical?.children?.map(route => route.path ?? 'index')).toEqual([
      'index',
      ':insightId',
    ]);
    expect(legacy?.children?.map(route => route.path ?? 'index')).toEqual(['index', ':insightId']);
  });

  it('redirects the V2 list alias to the canonical route', async () => {
    renderAlias('/ui/project-1/data-marts/dm-1/insights-v2');

    expect(await screen.findByText('/ui/project-1/data-marts/dm-1/insights')).toBeInTheDocument();
  });

  it('preserves insightId when redirecting the V2 detail alias', async () => {
    renderAlias('/ui/project-1/data-marts/dm-1/insights-v2/insight-7');

    expect(
      await screen.findByText('/ui/project-1/data-marts/dm-1/insights/insight-7')
    ).toBeInTheDocument();
  });
});
