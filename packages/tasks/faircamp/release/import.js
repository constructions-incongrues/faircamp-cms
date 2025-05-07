#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import task from 'tasuku';

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
    return null;
  }
};

// Main function to import a folder as a release
async function importRelease(folderPath, catalogSlug, releaseTitle, releaseDate, options = {}) {
  const contentDir = options.contentDir || DEFAULT_CONTENT_DIR;
  const releaseDir = path.join(contentDir, 'catalogs', catalogSlug, 'releases');
  const files = await fs.readdir(folderPath);
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
  const releaseSlug = createSlug(releaseTitle);
  const releasePath = path.join(releaseDir, releaseSlug);
  await task('Create release directory', async () => {
    await fs.mkdir(releasePath, { recursive: true });
  });
  const tracks = [];
  await task.group(task => audioFiles.map((file, index) => task(`Process track: ${file}`, async () => {
    const filePath = path.join(folderPath, file);
    const metadata = getAudioMetadata(filePath);
    const title = path.parse(file).name;
    const audioFileName = `${index + 1}-${path.basename(file)}`;
    const audioFilePath = path.join(releasePath, audioFileName);
    await fs.copyFile(filePath, audioFilePath);
    tracks.push({
      title,
      audio_file: audioFileName,
      description: metadata?.format?.tags?.comment || '',
    });
  })));
  let coverImage = null;
  if (imageFiles.length > 0) {
    await task('Process cover image', async () => {
      const coverFile = imageFiles[0];
      const coverFilePath = path.join(folderPath, coverFile);
      const dimensions = getImageDimensions(coverFilePath);
      const coverFileName = `cover${path.extname(coverFile)}`;
      const coverDestPath = path.join(releasePath, coverFileName);
      await fs.copyFile(coverFilePath, coverDestPath);
      coverImage = {
        description: 'Cover image',
        file: coverFileName
      };
      for (let i = 1; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const imageFilePath = path.join(folderPath, imageFile);
        const imageFileName = `image-${i}${path.extname(imageFile)}`;
        const imageDestPath = path.join(releasePath, imageFileName);
        await fs.copyFile(imageFilePath, imageDestPath);
      }
    });
  }
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
  if (coverImage) {
    releaseData.cover = coverImage;
  }
  await task('Write release.json', async () => {
    const releaseJsonPath = path.join(releasePath, 'release.json');
    await fs.writeFile(releaseJsonPath, JSON.stringify(releaseData, null, 2));
  });
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <folder-path> <catalog-slug> [release-title] [release-date] [--content-dir=<path>]')
  .option('content-dir', {
    describe: 'Content directory',
    type: 'string',
    default: DEFAULT_CONTENT_DIR
  })
  .demandCommand(2)
  .help()
  .argv;

const [folderPath, catalogSlug, releaseTitle = path.basename(argv._[0]), releaseDate] = argv._;

(async () => {
  try {
    await importRelease(folderPath, catalogSlug, releaseTitle, releaseDate, {
      contentDir: argv['content-dir']
    });
    console.log('✅ Release import complete.');
  } catch (error) {
    console.error('❌ Error importing release:', error.message);
    process.exit(1);
  }
})(); 