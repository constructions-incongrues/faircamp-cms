#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Default configuration - relative to current working directory
const DEFAULT_CONTENT_DIR = 'content';

// Helper function to get file extension
const getFileExtension = (filename) => path.extname(filename).toLowerCase().slice(1);

// Helper function to sanitize filename for slug
const createSlug = (filename) => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Helper function to get audio file metadata using ffprobe
const getAudioMetadata = (filePath) => {
  try {
    const ffprobeOutput = execSync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
    ).toString();
    return JSON.parse(ffprobeOutput);
  } catch (error) {
    console.error(`Error getting metadata for ${filePath}:`, error);
    return null;
  }
};

// Helper function to get image dimensions using ffprobe
const getImageDimensions = (filePath) => {
  try {
    const ffprobeOutput = execSync(
      `ffprobe -v quiet -print_format json -show_streams "${filePath}"`
    ).toString();
    const data = JSON.parse(ffprobeOutput);
    const stream = data.streams.find(s => s.width && s.height);
    return stream ? { width: stream.width, height: stream.height } : null;
  } catch (error) {
    console.error(`Error getting dimensions for ${filePath}:`, error);
    return null;
  }
};

// Main function to import a folder as a release
async function importRelease(folderPath, catalogSlug, releaseTitle, releaseDate, options = {}) {
  try {
    // Set up directories
    const contentDir = options.contentDir || DEFAULT_CONTENT_DIR;

    // Create necessary directories
    const releaseDir = path.join(contentDir, 'catalogs', catalogSlug, 'releases');
    await fs.mkdir(releaseDir, { recursive: true });

    // Read all files from the folder
    const files = await fs.readdir(folderPath);
    
    // Filter audio and image files
    const audioFiles = files.filter(file => {
      const ext = getFileExtension(file);
      return ['mp3', 'wav', 'flac', 'ogg'].includes(ext);
    });

    const imageFiles = files.filter(file => {
      const ext = getFileExtension(file);
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    });

    if (audioFiles.length === 0) {
      throw new Error('No audio files found in the specified folder');
    }

    // Create release slug from title
    const releaseSlug = createSlug(releaseTitle);
    const releasePath = path.join(releaseDir, releaseSlug);

    // Create release directory
    await fs.mkdir(releasePath, { recursive: true });

    // Process tracks
    const tracks = [];
    for (const [index, file] of audioFiles.entries()) {
      const filePath = path.join(folderPath, file);
      const metadata = getAudioMetadata(filePath);
      
      // Get title from filename (remove extension)
      const title = path.parse(file).name;
      
      // Copy audio file to release directory
      const audioFileName = `${index + 1}-${path.basename(file)}`;
      const audioFilePath = path.join(releasePath, audioFileName);
      await fs.copyFile(filePath, audioFilePath);

      tracks.push({
        title,
        audio_file: audioFileName,
        description: metadata?.format?.tags?.comment || '',
      });
    }

    // Process images
    let coverImage = null;
    if (imageFiles.length > 0) {
      // Use the first image as cover
      const coverFile = imageFiles[0];
      const coverFilePath = path.join(folderPath, coverFile);
      const dimensions = getImageDimensions(coverFilePath);
      
      // Copy cover image to release directory
      const coverFileName = `cover${path.extname(coverFile)}`;
      const coverDestPath = path.join(releasePath, coverFileName);
      await fs.copyFile(coverFilePath, coverDestPath);

      coverImage = {
        description: 'Cover image',
        file: coverFileName
      };

      // Copy additional images if any
      for (let i = 1; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const imageFilePath = path.join(folderPath, imageFile);
        const imageFileName = `image-${i}${path.extname(imageFile)}`;
        const imageDestPath = path.join(releasePath, imageFileName);
        await fs.copyFile(imageFilePath, imageDestPath);
      }
    }

    // Create release JSON
    const releaseData = {
      title: releaseTitle,
      catalog: catalogSlug,
      date: releaseDate || new Date().toISOString().split('T')[0],
      tracks,
      synopsis: '',
      more: '',
      release_artist: '',
      track_artist: '',
      unlisted: false,
      copy_link: 'enabled',
      embedding: 'disabled',
      speed_controls: 'enabled',
      m3u: 'disabled',
      track_numbering: 'arabic-dotted',
    };

    // Add cover image if available
    if (coverImage) {
      releaseData.cover = coverImage;
    }

    // Write release JSON file
    const releaseJsonPath = path.join(releasePath, 'release.json');
    await fs.writeFile(releaseJsonPath, JSON.stringify(releaseData, null, 2));

    console.log(`Successfully imported release "${releaseTitle}"`);
    console.log(`Release JSON created at: ${releaseJsonPath}`);
    console.log(`Number of tracks processed: ${tracks.length}`);
    if (imageFiles.length > 0) {
      console.log(`Number of images processed: ${imageFiles.length}`);
    }

  } catch (error) {
    console.error('Error importing release:', error);
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  const positionalArgs = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || args[++i];
    } else {
      positionalArgs.push(arg);
    }
  }

  return { options, positionalArgs };
}

// Get command line arguments
const { options, positionalArgs } = parseArgs();

if (positionalArgs.length < 2) {
  console.error('Usage: node import-release.js <folder-path> <catalog-slug> [release-title] [release-date] [--content-dir=<path>]');
  console.error('\nPaths are relative to the current working directory.');
  console.error('Default paths:');
  console.error(`  content-dir: ${DEFAULT_CONTENT_DIR}`);
  process.exit(1);
}

const [folderPath, catalogSlug, releaseTitle = path.basename(folderPath), releaseDate] = positionalArgs;

// Run the import with options
importRelease(folderPath, catalogSlug, releaseTitle, releaseDate, {
  contentDir: options['content-dir']
}); 