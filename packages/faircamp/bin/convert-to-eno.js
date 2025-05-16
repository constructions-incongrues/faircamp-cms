#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, basename, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { toEno } from '../utils/eno.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import task from 'tasuku';

const __dirname = dirname(fileURLToPath(import.meta.url));

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options] <path>')
  .option('output', {
    alias: 'o',
    describe: 'Output directory (default: same as input)',
    type: 'string',
    default: null
  })
  .option('pattern', {
    alias: 'p',
    describe: 'Filter files by pattern (regex)',
    type: 'string',
    default: null
  })
  .option('dry-run', {
    alias: 'd',
    describe: 'Show what would be converted without writing files',
    type: 'boolean',
    default: false
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Show detailed progress',
    type: 'boolean',
    default: false
  })
  .option('ignore-empty', {
    alias: 'i',
    describe: 'Skip empty fields in output',
    type: 'boolean',
    default: true
  })
  .option('skip-fields', {
    alias: 's',
    describe: 'Comma-separated list of fields to skip',
    type: 'string',
    default: ''
  })
  .option('use-flags', {
    alias: 'f',
    describe: 'Output boolean true values as flags',
    type: 'boolean',
    default: false
  })
  .option('force-multiline', {
    alias: 'm',
    describe: 'Comma-separated list of fields to force multiline format',
    type: 'string',
    default: ''
  })
  .demandCommand(1)
  .help()
  .argv;

const options = {
  output: argv.output,
  pattern: argv.pattern ? new RegExp(argv.pattern) : null,
  dryRun: argv['dry-run'],
  verbose: argv.verbose,
  ignoreEmpty: argv['ignore-empty'],
  skipFields: argv['skip-fields'] ? argv['skip-fields'].split(',').map(field => field.trim()) : [],
  useFlags: argv['use-flags'],
  forceMultiline: argv['force-multiline'] ? argv['force-multiline'].split(',').map(field => field.trim()) : []
};

let inputPath = argv._[0];

const stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0
};

function convertFile(inputPath, outputPath) {
  return task(`Convert ${inputPath} to ${outputPath}`, async () => {
    try {
      const jsonContent = readFileSync(inputPath, 'utf8');
      const json = JSON.parse(jsonContent);
      const enoContent = toEno(json, '', options.ignoreEmpty, options.skipFields, options.useFlags, options.forceMultiline);
      if (options.dryRun) {
        if (options.verbose) {
          console.log(`[DRY RUN] Would convert ${inputPath} to ${outputPath}`);
        }
        return;
      }
      const outputDir = dirname(outputPath);
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(outputPath, enoContent, 'utf8');
      if (options.verbose) {
        console.log(`Converted ${inputPath} to ${outputPath}`);
      }
      stats.converted++;
    } catch (error) {
      console.error(`Error converting ${inputPath}:`, error.message);
      stats.errors++;
    }
  });
}

function getOutputPath(inputPath) {
  if (!options.output) {
    return inputPath.replace(/\.json$/, '.eno');
  }
  const relPath = relative(resolve(inputPath), resolve(inputPath));
  const outputPath = join(options.output, relPath);
  return outputPath.replace(/\.json$/, '.eno');
}

async function processPath(pathToProcess) {
  const statsFile = statSync(pathToProcess);
  if (statsFile.isDirectory()) {
    const entries = readdirSync(pathToProcess, { withFileTypes: true });
    await task.group(task => entries.map(entry => task(`Process ${entry.name}`, async () => {
      const fullPath = join(pathToProcess, entry.name);
      if (entry.isDirectory()) {
        await processPath(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        if (options.pattern && !options.pattern.test(entry.name)) {
          if (options.verbose) {
            console.log(`Skipping ${fullPath}: doesn't match pattern`);
          }
          stats.skipped++;
          return;
        }
        stats.total++;
        const outputPath = getOutputPath(fullPath);
        await convertFile(fullPath, outputPath);
      }
    })));
  } else if (statsFile.isFile() && pathToProcess.endsWith('.json')) {
    if (options.pattern && !options.pattern.test(basename(pathToProcess))) {
      if (options.verbose) {
        console.log(`Skipping ${pathToProcess}: doesn't match pattern`);
      }
      stats.skipped++;
      return;
    }
    stats.total++;
    const outputPath = getOutputPath(pathToProcess);
    await convertFile(pathToProcess, outputPath);
  } else {
    if (options.verbose) {
      console.log(`Skipping ${pathToProcess}: not a JSON file`);
    }
    stats.skipped++;
  }
}

(async () => {
  await processPath(inputPath);
  console.log('\nConversion Summary:');
  console.log(`Total files found: ${stats.total}`);
  console.log(`Successfully converted: ${stats.converted}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  if (stats.errors > 0) {
    process.exit(1);
  }
})(); 