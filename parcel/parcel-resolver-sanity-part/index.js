const { Resolver } = require('@parcel/plugin')

module.exports = new Resolver({
  resolve({ specifier }) {
    if (specifier.startsWith('part:')) {
      return {isExcluded: true};
    }

    return null;
  }
});