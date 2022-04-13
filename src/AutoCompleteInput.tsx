import React from 'react';
import pick from 'just-pick';
import get from 'just-safe-get';
import compact from 'just-compact';
import unique from 'just-unique';
import { useId } from '@reach/auto-id'
import { Autocomplete, Text, Card } from '@sanity/ui';
import { StringSchemaType, Path, Marker } from '@sanity/types';
import PatchEvent, { set, unset } from '@sanity/form-builder/PatchEvent';
import { FormFieldPresence } from '@sanity/base/presence';
import { FormField } from '@sanity/base/components';
import { getSanityClient } from './utils/getSanityClient';
import { SanityDocument } from '@sanity/client';

type Option = {
  value: string;
}

type AutocompleteOptions<Parent = Record<string, unknown>, Params = Record<string, unknown>> = {
  autocompleteFieldPath?: string
  disableNew?: boolean
  options?: Option[];
  groq?: {
    query: string;
    params?: Params | ((parent?: Parent) =>Params);
    transform?: (result: any) => Option[]
  };
}

type Props<Parent = Record<string, unknown>, Params = Record<string, unknown>> = {
  type: StringSchemaType & {
    options?: AutocompleteOptions<Parent, Params>;
  };
  focusPath?: Path;
  level: number;
  value: string | null | undefined;
  readOnly: boolean | null;
  onChange: (patchEvent: PatchEvent) => void;
  onFocus: (path?: Path | React.FocusEvent<any>) => void;
  onBlur?: () => void;
  markers: Marker[];
  presence: FormFieldPresence[];
  parent?: Parent
};

export const AutoCompleteInput = React.forwardRef<HTMLInputElement, Props>(function (props, ref) {
  const { type, level, presence, markers, readOnly, value, parent, onFocus, onBlur, onChange } = props;
  const inputId = useId();
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [options, setOptions] = React.useState<Option[]>([]);

  const canCreateNew = React.useMemo(() => type.options?.disableNew !== true, [type])
  const optionsList = React.useMemo<(Option & { isNew?: boolean })[]>(() => {
    const uniqueOptions = unique(options.map(({ value }) => value), false, true);
    const queryInOptions = uniqueOptions.find(value => value === query);
    if (!queryInOptions && canCreateNew) {
      return [
        ...uniqueOptions.map((value) => ({ value })),
        { value: query, isNew: true }
      ]
    }

    return uniqueOptions.map((value) => ({ value }));
  }, [query, options, canCreateNew])

  const errors = React.useMemo(
    () => markers.filter((marker) => marker.type === 'validation' && marker.level === 'error'),
    [markers]
  )

  const handleQueryChange = React.useCallback((query: string) => {
    setQuery(query);
  }, [])

  const handleChange = React.useCallback((value: string) => {
    onChange(PatchEvent.from(value ? set(value) : unset()))
  }, [onChange]);

  React.useEffect(() => {
    const sanityClient = getSanityClient();

    if (type.options?.options) {
      setLoading(false);
      setOptions(type.options.options);
    } else {
      const path = type.options?.autocompleteFieldPath ?? 'title';
      const { query, transform, params = {} } = type.options?.groq || {
        query: `*[defined(${path})] { "value": ${path} }`,
      }

      const resolvedParams = typeof params === 'function'
        ? params(parent)
        : params

      sanityClient.fetch(query, resolvedParams).then((results) => {
        if (Array.isArray(results)) {
          const transformedResults = transform ? transform(results) : results
          const compactedValues = compact(transformedResults.map((doc) => get(doc, 'value')));
          setLoading(false);
          setOptions(compactedValues.map((value) => ({ value: String(value) })));
        }
      })
    }
  }, [type.options]);

  return (
    <FormField
      description={type.description}
      inputId={inputId}
      level={level}
      __unstable_markers={markers}
      __unstable_presence={presence}
      title={type.title}
    >
      <Autocomplete
        ref={ref}
        id={inputId ?? ''}
        customValidity={errors.length > 0 ? errors[0].item.message : ''}
        readOnly={readOnly ?? false}
        loading={loading}
        disabled={loading}
        options={optionsList}
        value={value ?? ''}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={handleChange}
        onQueryChange={handleQueryChange}
        renderOption={(option) => (
          <Card as="button" padding={3} tone={option.isNew ? 'primary' : 'default'} shadow={1}>
            {option.isNew ? (
              canCreateNew &&
                <Text>Create new option "{option.value}"</Text>
            ) : (
              <Text>{option.value}</Text>
            )}
          </Card>
        )}
      />
    </FormField>
  );
});
