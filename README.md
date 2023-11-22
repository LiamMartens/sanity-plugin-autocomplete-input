# sanity-plugin-autocomplete-input

[![https://img.shields.io/npm/v/sanity-plugin-autocomplete-input](https://img.shields.io/npm/v/sanity-plugin-autocomplete-input)](https://www.npmjs.com/package/sanity-plugin-autocomplete-input)

![example](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-autocomplete-input/main/docs/img/example.gif)

This plugin is similar to the [Autocomplete Tags Plugin](https://www.sanity.io/plugins/autocomplete-tags), but it acts as a single text input as opposed to an array of tags. The input can also be customized to change the autocomplete options.

## Installation

```
npm install --save sanity-plugin-autocomplete-input
```

or

```
yarn add sanity-plugin-autocomplete-input
```

## Usage

Add it as a plugin in sanity.config.ts (or .js):

```js
import { autocompletInput } from "sanity-plugin-autocomplete-input";

export default defineConfig({
  // ...
  plugins: [autocompletInput()],
});
```

You can just use it as a schema type. To customize the autocomplete list you have 3 options:

1. Specify the `autocompleteFieldPath` option, which the plugin will use to look for documents with the same field path to aggregate the option values.
2. Manually specify options in the schema option
3. Specify your own GROQ query returning a `[{ "value": "foobar" }]` format (you can use a `transform` function if this is not achievable using GROQ only)

```javascript
export default {
  fields: [
    {
      name: "autocomplete-input",
      type: "autocomplete",
      options: {
        // specify field path
        autocompleteFieldPath: "title",
        // this option can be used to disable using "new" values
        disableNew: false,
        // manually specify options
        options: [{ value: "Option 1" }, { value: "Option 2" }],
        // specify custom groq query
        groq: {
          query: '*[_type == $type] { "value": title }',
          params: {
            type: "page",
          },
          transform: (values) => values,
        },
      },
    },
  ],
};
```

### Advanced GROQ parameters

It is also possible to refer to the current parent value (for a top-level field this would be the current document) by passing a function to the `params` option:

```javascript
export default {
  fields: [
    {
      name: "autocomplete-input",
      type: "autocomplete",
      options: {
        groq: {
          query: "*[_id != $docId]",
          params: (parent) => ({
            docId: parent?._id,
          }),
        },
      },
    },
  ],
};
```
