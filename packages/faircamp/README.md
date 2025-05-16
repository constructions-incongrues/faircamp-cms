# Faircamp

A comprehensive toolkit for Faircamp CMS - a modern, lightweight alternative to Bandcamp that integrates with static site generators.

This package combines several previously separate modules into a single, unified package:
- Collection schemas (Catalog, Artist, Release, Track)
- Configuration utilities
- CLI tools for content management

## Installation

```sh
npm install faircamp
# or
yarn add faircamp
# or 
pnpm add faircamp
```

## Usage

### Collection Schemas

Import the collection schemas to define your content models:

```js
import { Catalog, Artist, Release, Track } from 'faircamp/collections';

// Get the default schema
const catalog = Catalog();

// Override any part of the schema
const customCatalog = Catalog({ 
  label: 'My Custom Catalog', 
  fields: [/* ... */] 
});
```

### Configuration

Use the config module to access and customize configuration:

```js
import { getConfig } from 'faircamp/config';

// Get the default config
const config = getConfig();

// Override the locale
const frenchConfig = getConfig({ locale: 'fr' });

// Override multiple values
const customConfig = getConfig({ 
  mediaFolder: 'custom/media', 
  locale: 'es' 
});
```

#### Multiple Configurations

Faircamp supports managing multiple named configurations:

```js
import { 
  registerConfig, 
  updateConfig,
  getNamedConfig, 
  setActiveConfig,
  getActiveConfigName,
  listConfigs,
  deleteConfig
} from 'faircamp/config';

// Register a new configuration
registerConfig('development', {
  backend: {
    name: 'local',
    url: 'http://localhost:8081/api'
  }
});

// Register and make active
registerConfig('production', {
  backend: {
    name: 'github',
    repo: 'myorg/mysite',
    branch: 'main'
  }
}, true);

// Update an existing configuration
updateConfig('development', { 
  locale: 'fr',
  media_folder: 'dev/media'
});

// Get a named configuration
const prodConfig = getNamedConfig('production');

// Switch between configurations
setActiveConfig('development');
console.log(getActiveConfigName()); // 'development'

// List all available configurations
const configNames = listConfigs(); // ['default', 'development', 'production']

// Delete a configuration
deleteConfig('development');
```

### CLI Tools

The package includes several command-line utilities for managing Faircamp CMS content:

#### 1. Import a Release

Import a folder of audio and image files as a new release in your Faircamp CMS content structure.

```sh
faircamp-release-import <folder-path> <catalog-slug> [release-title] [release-date] [--content-dir=<path>]
```

- `<folder-path>`: Path to the folder containing audio/image files
- `<catalog-slug>`: Catalog slug to import into
- `[release-title]`: Optional release title (defaults to folder name)
- `[release-date]`: Optional release date (defaults to today)
- `--content-dir`: Content directory (default: `content`)

#### 2. Update Track Metadata

Batch-update audio file metadata for all tracks in all releases, using the information in each `release.json`.

```sh
faircamp-track-update-metadata [--content-dir=<path>]
```

- `--content-dir`: Content directory (default: `var/repo/content`)

#### 3. Convert JSON to ENO

Convert JSON files (or directories of JSON files) to [Eno](https://eno-lang.org/) format.

```sh
faircamp-json-convert-to-eno [options] <path>
```

**Options:**
- `-o, --output <dir>`: Output directory (default: same as input)
- `-p, --pattern <regex>`: Filter files by pattern
- `-d, --dry-run`: Show what would be converted without writing files
- `-v, --verbose`: Show detailed progress
- `-i, --ignore-empty`: Skip empty fields in output
- `-s, --skip-fields <fields>`: Comma-separated list of fields to skip
- `-f, --use-flags`: Output boolean true values as flags
- `-m, --force-multiline <fields>`: Comma-separated list of fields to force multiline format

## JSDoc Type Hints

The package includes JSDoc comments for better code completion in editors that support it.

## API Reference

### Collections Module

- `Catalog(overrides)` - Create a catalog schema
- `Artist(overrides)` - Create an artist schema
- `Release(overrides)` - Create a release schema
- `Track(overrides)` - Create a track schema

### Config Module

- `getConfig(overrides)` - Get active configuration with optional overrides
- `registerConfig(name, config, makeActive)` - Register a new named configuration
- `updateConfig(name, configUpdates)` - Update an existing configuration
- `getNamedConfig(name)` - Get a configuration by name
- `setActiveConfig(name)` - Set the active configuration
- `getActiveConfigName()` - Get the name of the active configuration
- `listConfigs()` - List all available configuration names
- `deleteConfig(name)` - Delete a named configuration

## Schema Structure

The package provides four main collection schemas:

1. **Catalog** - Root collection for your music catalog
2. **Artist** - Music creators/performers
3. **Release** - Albums, EPs, singles
4. **Track** - Individual songs

Each schema comes with sensible defaults and can be customized with overrides.

## License

MIT