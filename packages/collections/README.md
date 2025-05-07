# @faircamp-cms/collections

This package contains all Faircamp CMS collection schemas: Catalog, Artist, Release, and Track.

## Usage

```js
const { Catalog, Artist, Release, Track } = require('@faircamp-cms/collections');

// Get the default schema
const catalog = Catalog();

// Override any part of the schema
const customCatalog = Catalog({ label: 'My Custom Catalog', fields: [/* ... */] });
```

## TypeScript

Type definitions are included:

```ts
import { Catalog, CollectionSchema } from '@faircamp-cms/collections';
const schema: CollectionSchema = Catalog();
```

## Testing

To run tests:

```
npm test
```

## License

MIT 