const HIDDEN_CONNECTOR_NAMES = new Set([
  'BankOfCanada',
  'CriteoAds',
  'MicrosoftAds',
  'OpenExchangeRates',
  'OpenHolidays',
  'RedditAds',
]);

export function isConnectorSelectable(connectorName: string): boolean {
  return !HIDDEN_CONNECTOR_NAMES.has(connectorName);
}
