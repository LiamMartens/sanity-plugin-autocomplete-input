import React from "react";
import { defineType, StringDefinition } from "sanity";
import type { InputOptions } from "../types";
import { AutoCompleteInput } from "../AutoCompleteInput";

const typeName = "autocomplete" as const;

/**
 * @public
 */
export interface AutocompleteStringDefinition extends Omit<StringDefinition, "type" | "fields" | "options"> {
  type: typeof typeName;
  options?: InputOptions;
}

declare module "@sanity/types" {
  // makes type: 'color' narrow correctly when using defineTyp/defineField/defineArrayMember
  export interface IntrinsicDefinitions {
    autocomplete: AutocompleteStringDefinition;
  }
}

export const autocompleteString = defineType({
  name: typeName,
  type: "string",
  title: "Autocomplete",
  components: { input: AutoCompleteInput },
});
