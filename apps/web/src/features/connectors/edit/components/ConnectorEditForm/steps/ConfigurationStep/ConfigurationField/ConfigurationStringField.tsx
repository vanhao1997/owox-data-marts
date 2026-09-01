import { Input } from '@owox/ui/components/input';
import type { ConnectorSpecificationResponseApiDto } from '../../../../../../shared/api/types';

interface ConfigurationStringFieldProps {
  specification: ConnectorSpecificationResponseApiDto;
  configuration: Record<string, unknown>;
  onValueChange: (name: string, value: unknown) => void;
}

export function ConfigurationStringField({
  specification,
  configuration,
  onValueChange,
}: ConfigurationStringFieldProps) {
  const { name, placeholder } = specification;
  const displayName = specification.title ?? specification.name;

  const marker = configuration[name];
  const markerValue =
    marker && typeof marker === 'object' && !Array.isArray(marker)
      ? Object.values(marker as Record<string, unknown>)[0]
      : undefined;
  const displayValue =
    typeof markerValue === 'string'
      ? '{{saved variable}}'
      : typeof marker === 'string'
        ? marker
        : '';
  return (
    <Input
      id={name}
      name={name}
      type='text'
      value={displayValue}
      readOnly={Boolean(marker && typeof marker === 'object')}
      placeholder={placeholder ?? `Enter ${displayName.toLowerCase()}`}
      onChange={e => {
        onValueChange(name, e.target.value);
      }}
    />
  );
}
