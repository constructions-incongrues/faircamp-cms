# Faircamp CMS Tasks

This package provides a set of CLI utilities for managing Faircamp CMS content. All scripts use [tasuku](https://github.com/privatenumber/tasuku) for beautiful task visualization and [yargs](https://github.com/yargs/yargs) for consistent argument parsing and help output.

## Installation

From the root of your monorepo:

```sh
pnpm install
```

Or, if you want to use these scripts globally:

```sh
pnpm install -g ./packages/tasks
```

## CLI Scripts

### 1. `faircamp:release:import`

Import a folder of audio and image files as a new release in your Faircamp CMS content structure.

**Usage:**

```sh
faircamp:release:import <folder-path> <catalog-slug> [release-title] [release-date] [--content-dir=<path>]
```

- `<folder-path>`: Path to the folder containing audio/image files
- `<catalog-slug>`: Catalog slug to import into
- `[release-title]`: Optional release title (defaults to folder name)
- `[release-date]`: Optional release date (defaults to today)
- `--content-dir`: Content directory (default: `content`)

**Example:**

```sh
faircamp:release:import ./my-album electron-echo "My Album Title" 2024-06-01 --content-dir=var/repo/content
```

---

### 2. `faircamp:track:update-metadata`

Batch-update audio file metadata for all tracks in all releases, using the information in each `release.json`.

**Usage:**

```sh
faircamp:track:update-metadata [--content-dir=<path>]
```

- `--content-dir`: Content directory (default: `var/repo/content`)

**Example:**

```sh
faircamp:track:update-metadata --content-dir=var/repo/content
```

---

### 3. `faircamp:json:convert-to-eno`

Convert JSON files (or directories of JSON files) to [Eno](https://eno-lang.org/) format.

**Usage:**

```sh
faircamp:json:convert-to-eno [options] <path>
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

**Example:**

```sh
faircamp:json:convert-to-eno ./releases --output ./eno-releases --pattern release --verbose
```

---

## Features
- **Task visualization:** All scripts use [tasuku](https://github.com/privatenumber/tasuku) for clear, interactive progress output.
- **Consistent CLI:** All scripts use [yargs](https://github.com/yargs/yargs) for argument parsing and help.
- **Modern codebase:** ES modules, async/await, and robust error handling.

## License

MIT 