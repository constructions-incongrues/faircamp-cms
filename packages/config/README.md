# @faircamp-cms/config

This package contains shared configuration and utilities for the Faircamp CMS monorepo. Use this package to centralize and reuse configuration values, schemas, and helpers across the project.

## Usage

Import the `getConfig` function to access the configuration. You can provide an optional overrides object to override any default values.

### Example

```js
const { getConfig } = require('@faircamp-cms/config');

// Get the default config
const config = getConfig();
// { mediaFolder: 'static/media/uploads', publicFolder: '/media/uploads', locale: 'en' }

// Override the locale
const frenchConfig = getConfig({ locale: 'fr' });
// { mediaFolder: 'static/media/uploads', publicFolder: '/media/uploads', locale: 'fr' }

// Override multiple values
const customConfig = getConfig({ mediaFolder: 'custom/media', locale: 'es' });
// { mediaFolder: 'custom/media', publicFolder: '/media/uploads', locale: 'es' }
```

## API

### getConfig(overrides?)
- `overrides` (object, optional): Any subset of the config keys to override.
- Returns: The merged config object.

## TypeScript
Type definitions are included. You can import the `FaircampConfig` type:

```ts
import type { FaircampConfig } from '@faircamp-cms/config';
``` 