import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import type { ConnectorListItem } from '../../../../shared/model/types/connector';
import { ConnectorSelectionStep } from './ConnectorSelectionStep';

vi.mock('../../../../../../utils', () => ({ trackEvent: vi.fn() }));
vi.mock('../../../../../../shared/components/InviteTeammatesCard', () => ({
  InviteTeammatesCard: () => null,
}));

function connector(name: string, displayName: string): ConnectorListItem {
  return {
    name,
    displayName,
    description: '',
    logoBase64: null,
    docUrl: null,
  };
}

function renderStep(connectors: ConnectorListItem[], onConnectorSelect = vi.fn()) {
  render(
    <MemoryRouter>
      <ConnectorSelectionStep
        connectors={connectors}
        selectedConnector={null}
        loading={false}
        error={null}
        onConnectorSelect={onConnectorSelect}
      />
    </MemoryRouter>
  );

  return onConnectorSelect;
}

describe('ConnectorSelectionStep connector visibility', () => {
  const hiddenConnectors = [
    connector('BankOfCanada', 'Bank of Canada'),
    connector('CriteoAds', 'Criteo Ads'),
    connector('MicrosoftAds', 'Microsoft Ads'),
    connector('OpenExchangeRates', 'Open Exchange Rates'),
    connector('OpenHolidays', 'Open Holidays'),
    connector('RedditAds', 'Reddit Ads'),
  ];

  it('hides deployment-disabled connectors while preserving available connectors', () => {
    const admicro = connector('AdmicroAds', 'Admicro Ads');
    const onConnectorSelect = renderStep([...hiddenConnectors, admicro]);

    for (const hiddenConnector of hiddenConnectors) {
      expect(screen.queryByText(hiddenConnector.displayName)).not.toBeInTheDocument();
    }

    fireEvent.click(screen.getByText('Admicro Ads'));
    expect(onConnectorSelect).toHaveBeenCalledWith(admicro);
  });

  it('shows the empty state when every returned connector is hidden', () => {
    renderStep(hiddenConnectors);

    expect(screen.getByText('No connectors available')).toBeInTheDocument();
  });
});
