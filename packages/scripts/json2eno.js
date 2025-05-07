#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, basename, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { toEno } from '../utils/eno.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  output: null,
  pattern: null,
  dryRun: false,
  verbose: false,
  ignoreEmpty: true,
  skipFields: [],
  useFlags: false,
  forceMultiline: []
};

let inputPath = null;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--output' || arg === '-o') {
    options.output = args[++i];
  } else if (arg === '--pattern' || arg === '-p') {
    options.pattern = new RegExp(args[++i]);
  } else if (arg === '--dry-run' || arg === '-d') {
    options.dryRun = true;
  } else if (arg === '--verbose' || arg === '-v') {
    options.verbose = true;
  } else if (arg === '--ignore-empty' || arg === '-i') {
    options.ignoreEmpty = true;
  } else if (arg === '--skip-fields' || arg === '-s') {
    options.skipFields = args[++i].split(',').map(field => field.trim());
  } else if (arg === '--use-flags' || arg === '-f') {
    options.useFlags = true;
  } else if (arg === '--force-multiline' || arg === '-m') {
    options.forceMultiline = args[++i].split(',').map(field => field.trim());
  } else if (!arg.startsWith('-')) {
    inputPath = arg;
  }
}

if (!inputPath) {
  console.error('Please provide a JSON file or directory path');
  console.error('Usage: node json2eno.js [options] <path>');
  console.error('\nOptions:');
  console.error('  -o, --output <dir>    Output directory (default: same as input)');
  console.error('  -p, --pattern <regex> Filter files by pattern');
  console.error('  -d, --dry-run        Show what would be converted without writing files');
  console.error('  -v, --verbose        Show detailed progress');
  console.error('  -i, --ignore-empty   Skip empty fields in output');
  console.error('  -s, --skip-fields    Comma-separated list of fields to skip');
  console.error('  -f, --use-flags      Output boolean true values as flags');
  console.error('  -m, --force-multiline Comma-separated list of fields to force multiline format');
  process.exit(1);
}

// Track statistics
const stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0
};

function convertFile(inputPath, outputPath) {
  try {
    // Read and parse JSON file
    const jsonContent = readFileSync(inputPath, 'utf8');
    const json = JSON.parse(jsonContent);

    // Convert to Eno
    const enoContent = toEno(json, '', options.ignoreEmpty, options.skipFields, options.useFlags, options.forceMultiline);

    if (options.dryRun) {
      console.log(`[DRY RUN] Would convert ${inputPath} to ${outputPath}`);
      return;
    }

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    mkdirSync(outputDir, { recursive: true });

    // Write Eno file
    writeFileSync(outputPath, enoContent, 'utf8');
    
    if (options.verbose) {
      console.log(`Converted ${inputPath} to ${outputPath}`);
    }
    
    stats.converted++;
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error.message);
    stats.errors++;
  }
}

function getOutputPath(inputPath) {
  if (!options.output) {
    return inputPath.replace(/\.json$/, '.eno');
  }

  // Get relative path from input directory
  const relativePath = relative(inputPath, inputPath);
  const outputPath = join(options.output, relativePath);
  return outputPath.replace(/\.json$/, '.eno');
}

function processPath(path) {
  const stats = statSync(path);

  if (stats.isDirectory()) {
    // If it's a directory, process all files in it
    const entries = readdirSync(path, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(path, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        processPath(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // Check if file matches pattern
        if (options.pattern && !options.pattern.test(entry.name)) {
          if (options.verbose) {
            console.log(`Skipping ${fullPath}: doesn't match pattern`);
          }
          stats.skipped++;
          continue;
        }

        stats.total++;
        const outputPath = getOutputPath(fullPath);
        convertFile(fullPath, outputPath);
      }
    }
  } else if (stats.isFile() && path.endsWith('.json')) {
    // Check if file matches pattern
    if (options.pattern && !options.pattern.test(basename(path))) {
      if (options.verbose) {
        console.log(`Skipping ${path}: doesn't match pattern`);
      }
      stats.skipped++;
      return;
    }

    stats.total++;
    const outputPath = getOutputPath(path);
    convertFile(path, outputPath);
  } else {
    if (options.verbose) {
      console.log(`Skipping ${path}: not a JSON file`);
    }
    stats.skipped++;
  }
}

// Process the input path
processPath(inputPath);

// Show summary
console.log('\nConversion Summary:');
console.log(`Total files found: ${stats.total}`);
console.log(`Successfully converted: ${stats.converted}`);
console.log(`Skipped: ${stats.skipped}`);
console.log(`Errors: ${stats.errors}`);

if (stats.errors > 0) {
  process.exit(1);
} 