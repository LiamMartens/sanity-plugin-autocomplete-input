import React from 'react';
import get from 'just-safe-get';
import compact from 'just-compact';
import { useId } from '@reach/auto-id'
import { Autocomplete } from '@sanity/ui';
import { StringSchemaType, Path, Marker } from '@sanity/types';
import PatchEvent, { set, unset } from '@sanity/form-builder/PatchEvent';
import { FormFieldPresence } from '@sanity/base/presence';
import { FormField } from '@sanity/base/components';
import { getSanityClient } from './utils/getSanityClient';

type Option = {
  value: string;
}

type AutocompleteOptions = {
  autocompleteFieldPath?: string
  options?: Option[];
  groq?: {
    query: string;
    params?: any;
  };
}

type Props = {
  type: StringSchemaType & {
    options?: AutocompleteOptions;
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
};

export const AutoCompleteInput = React.forwardRef<HTMLInputElement, Props>(function (props, ref) {
  const { type, level, presence, markers, readOnly, value, onFocus, onBlur, onChange } = props;
  const inputId = useId();
  const [loading, setLoading] = React.useState(true);
  const [options, setOptions] = React.useState<Option[]>([]);

  const errors = React.useMemo(
    () => markers.filter((marker) => marker.type === 'validation' && marker.level === 'error'),
    [markers]
  )

  const handleChange = React.useCallback((value: string) => {
    onChange(PatchEvent.from(value ? set(value) : unset()))
  }, [onChange]);

  React.useEffect(() => {
    const sanityClient = getSanityClient();

    if (type.options?.options) {
      setLoading(false);
      setOptions(type.options.options);
    }

    const path = type.options?.autocompleteFieldPath ?? 'title';
    const { query, params = {} } = type.options?.groq || {
      query: `*[defined(${path})] { "value": ${path} }`,
    }

    sanityClient.fetch(query, params).then((results) => {
      if (Array.isArray(results)) {
        const compactedValues = compact(results.map((doc) => get(doc, 'value')));
        setLoading(false);
        setOptions(compactedValues.map((value) => ({ value: String(value) })));
      }
    })
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
        options={options}
        value={value ?? ''}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={handleChange}
      />
    </FormField>
  );
});
