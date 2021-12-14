# sanity-plugin-autocomplete-input
This plugin is similar to the [Autocomplete Tags Plugin](https://www.sanity.io/plugins/autocomplete-tags), but it acts as a single text input as opposed to an array of tags. The input can also be customized to change the autocomplete options.

## Usage
You can just use it as a schema type. To customize the autocomplete list you have 3 options:
1. Specify the `autocompleteFieldPath` option, which the plugin will use to look for documents with the same field path to aggregate the option values.
2. Manually specify options in the schema option
3. Specify your own GROQ query returning a `[{ "value": "foobar" }]` format

```javascript
export default {
  fields: [
    {
      name: 'autocomplete-input',
      type: 'autocomplete',
      // specify field path
      autocompleteFieldPath: 'title',
      // manually specify options
      options: [
        { value: 'Option 1' },
        { value: 'Option 2' }
      ],
      // specify groq qury
      groq: {
        query: '*[_type == $type] { "value": title }',
        params: {
          type: 'page'
        },
        transform: (values) => values
      },
    }
  ]
}
```