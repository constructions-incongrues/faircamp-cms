#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import task from 'tasuku';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [--content-dir=<path>]')
  .option('content-dir', {
    describe: 'Content directory',
    type: 'string',
    default: path.join(PROJECT_ROOT, 'var/repo/content')
  })
  .help()
  .argv;

const CONTENT_DIR = argv['content-dir'];

let stats = {
  catalogs: 0,
  releases: 0,
  tracks: 0,
  processed: 0,
  skipped: 0,
  errors: 0
};

function quoteMetadataValue(value) {
  if (!value) return '';
  return `'${value.replace(/'/g, "'\\''")}'`;
}

async function getReleaseData(releasePath) {
  try {
    const data = await fs.promises.readFile(releasePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    stats.errors++;
    return null;
  }
}

async function setTrackMetadata(trackData, releaseData, releaseDir) {
  const decodedAudioFile = decodeURIComponent(trackData.audio_file);
  const audioFile = path.join(releaseDir, decodedAudioFile);
  try {
    await fs.promises.access(audioFile, fs.constants.R_OK);
    const statsFile = await fs.promises.stat(audioFile);
    if (statsFile.size === 0) {
      throw new Error(`Audio file is empty: ${audioFile}`);
    }
    const artist = trackData.artist || 
                  releaseData.track_artist || 
                  releaseData.track_artists?.[0] || 
                  releaseData.release_artist || 
                  releaseData.release_artists?.[0] || '';
    const year = releaseData.date ? new Date(releaseData.date).getFullYear().toString() : undefined;
    const genre = releaseData.tags ? releaseData.tags.join('; ') : '';
    const trackNumber = (releaseData.tracks.findIndex(t => t.audio_file === trackData.audio_file) + 1).toString();
    const totalTracks = releaseData.tracks.length.toString();
    const audioExt = path.extname(audioFile);
    const audioBaseName = path.basename(audioFile, audioExt);
    const tempFile = path.join(path.dirname(audioFile), `${audioBaseName}_temp${audioExt}`);
    await new Promise((resolve, reject) => {
      const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
      const command = ffmpeg(quoteMetadataValue(audioFile))
        .outputOptions([
          '-y',
          '-map_metadata', '0',
          '-metadata', `title=${quoteMetadataValue(trackData.title)}`,
          '-metadata', `artist=${quoteMetadataValue(artist)}`,
          '-metadata', `album=${quoteMetadataValue(releaseData.title)}`,
          '-metadata', `year=${quoteMetadataValue(year || '')}`,
          '-metadata', `comment=${quoteMetadataValue(trackData.description || releaseData.synopsis || '')}`,
          '-metadata', `genre=${quoteMetadataValue(genre)}`,
          '-metadata', `track=${quoteMetadataValue(trackNumber + '/' + totalTracks)}`,
          '-codec:a', 'copy'
        ])
        .output(quoteMetadataValue(tempFile))
        .on('end', () => {
          try {
            fs.renameSync(tempFile, audioFile);
            resolve();
          } catch (error) {
            reject(new Error(`Failed to replace file: ${error.message}`));
          }
        })
        .on('error', (err) => {
          try {
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
          } catch {}
          reject(err);
        });
      if (process.env.FFMPEG_PATH) {
        command.setFfmpegPath(process.env.FFMPEG_PATH);
      }
      command.run();
    });
    stats.processed++;
  } catch (error) {
    if (error.code === 'ENOENT') {
      stats.skipped++;
    } else {
      stats.errors++;
    }
  }
}

async function processRelease(releasePath) {
  const releaseData = await getReleaseData(releasePath);
  if (!releaseData || !releaseData.tracks) {
    stats.skipped++;
    return;
  }
  const releaseDir = path.dirname(releasePath);
  let hasAudioFiles = false;
  await task.group(task => releaseData.tracks.map(track => task(`Set metadata for track: ${track.title}`, async () => {
    if (track.audio_file) {
      hasAudioFiles = true;
      await setTrackMetadata(track, releaseData, releaseDir);
    }
  })));
  if (!hasAudioFiles) {
    stats.skipped++;
  }
}

async function processAllReleases() {
  await task('Update track metadata for all releases', async ({ task: subtask }) => {
    const catalogDirs = await fs.promises.readdir(path.join(CONTENT_DIR, 'catalogs'));
    stats.catalogs = catalogDirs.length;
    await task.group(task => catalogDirs.map(catalogDir => task(`Process catalog: ${catalogDir}`, async () => {
      const releasesDir = path.join(CONTENT_DIR, 'catalogs', catalogDir, 'releases');
      let releaseDirs = [];
      try {
        releaseDirs = await fs.promises.readdir(releasesDir);
        stats.releases += releaseDirs.length;
      } catch {
        return;
      }
      await task.group(task => releaseDirs.map(releaseDir => task(`Process release: ${releaseDir}`, async () => {
        const releasePath = path.join(releasesDir, releaseDir, 'release.json');
        await processRelease(releasePath);
      })));
    })));
  });
  console.log('\n=== Processing Complete ===');
  console.log(`Catalogs processed: ${stats.catalogs}`);
  console.log(`Releases found: ${stats.releases}`);
  console.log(`Tracks processed: ${stats.processed}`);
  console.log(`Tracks skipped: ${stats.skipped}`);
  console.log(`Errors encountered: ${stats.errors}`);
}

processAllReleases(); 