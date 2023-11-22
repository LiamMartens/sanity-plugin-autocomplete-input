import { definePlugin } from "sanity";
import { autocompleteString } from "./schemas/autocompleteString";

export const autocompletInput = definePlugin({
  name: "sanity-plugin-autocomplete-input",
  schema: {
    types: [autocompleteString],
  },
});
