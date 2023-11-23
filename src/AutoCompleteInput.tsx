import React, { useCallback, useEffect, useMemo, useState } from "react";
import get from "just-safe-get";
import compact from "just-compact";
import unique from "just-unique";
import { Autocomplete, Text, Card } from "@sanity/ui";
import {
  PatchEvent,
  StringInputProps,
  StringSchemaType,
  set,
  unset,
  useClient,
  useFormBuilder,
} from "sanity";
import type { InputOptions, Option } from "./types";

export type AutocompleteSchemaType = Omit<StringSchemaType, "options"> & {
  options?: StringSchemaType["options"] & InputOptions;
};
export type InputProps = StringInputProps<AutocompleteSchemaType>;

export const AutoCompleteInput = (props: InputProps) => {
  const { id, schemaType, value, validationError, readOnly, onChange } = props;

  const sanityClient = useClient();
  const { value: documentValue } = useFormBuilder();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<Option[]>([]);
  const canCreateNew = schemaType.options?.disableNew !== true;

  const optionsList = useMemo<(Option & { isNew?: boolean })[]>(() => {
    const uniqueOptions = unique(
      options.map(({ value }) => value),
      false,
      true
    );
    const queryInOptions = uniqueOptions.find((value) => value === query);
    if (!queryInOptions && canCreateNew) {
      return [...uniqueOptions.map((value) => ({ value })), { value: query, isNew: true }];
    }

    return uniqueOptions.map((value) => ({ value }));
  }, [query, options, canCreateNew]);

  const handleQueryChange = useCallback((query: string | null) => {
    setQuery(query ?? '');
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      onChange(PatchEvent.from(value ? set(value) : unset()));
    },
    [onChange]
  );

  useEffect(() => {
    if (schemaType.options?.options) {
      setLoading(false);
      setOptions(schemaType.options.options);
    } else {
      const path = schemaType.options?.autocompleteFieldPath ?? "title";
      const {
        query,
        transform,
        params = {},
      } = schemaType.options?.groq || {
        query: `*[defined(${path})] { "value": ${path} }`,
      };

      const resolvedParams = typeof params === "function" ? params(documentValue) : params;

      sanityClient.fetch(query, resolvedParams).then((results) => {
        if (Array.isArray(results)) {
          const transformedResults = transform ? transform(results) : results;
          const compactedValues = compact(transformedResults.map((doc) => get(doc, "value")));
          setLoading(false);
          setOptions(compactedValues.map((value) => ({ value: String(value) })));
        }
      });
    }
  }, [query, schemaType.options]);

  return (
    <Autocomplete
      id={id}
      readOnly={readOnly ?? false}
      customValidity={validationError}
      loading={loading}
      disabled={loading}
      options={optionsList}
      value={value ?? ""}
      onChange={handleChange}
      onQueryChange={handleQueryChange}
      renderOption={(option) => (
        <Card as="button" padding={3} tone={option.isNew ? "primary" : "default"} shadow={1}>
          {option.isNew ? canCreateNew && <Text>Create new option "{option.value}"</Text> : <Text>{option.value}</Text>}
        </Card>
      )}
    />
  );
};
