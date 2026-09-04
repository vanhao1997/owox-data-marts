import { ConnectorMapper } from './connector.mapper';

describe(ConnectorMapper.name, () => {
  it('preserves dynamic connector field labels in the API response', () => {
    const mapper = new ConnectorMapper();

    const result = mapper.toFieldsResponse([
      {
        name: 'campaign',
        fields: [
          {
            name: 'admicro_column_8',
            label: 'Impressions',
            type: 'INTEGER',
            description: 'Admicro column 8.',
          },
        ],
      },
    ]);

    expect(result[0].fields?.[0]).toEqual({
      name: 'admicro_column_8',
      label: 'Impressions',
      type: 'INTEGER',
      description: 'Admicro column 8.',
    });
  });
});
