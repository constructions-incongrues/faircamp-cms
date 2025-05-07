import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root directory (2 levels up from script location)
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// Parse command line arguments
const args = process.argv.slice(2);
const contentDirArg = args.find(arg => arg.startsWith('--content-dir='));
const CONTENT_DIR = contentDirArg 
  ? path.resolve(PROJECT_ROOT, contentDirArg.split('=')[1])
  : path.join(PROJECT_ROOT, 'var/repo/content');

// Statistics
let stats = {
  catalogs: 0,
  releases: 0,
  tracks: 0,
  processed: 0,
  skipped: 0,
  errors: 0
};

// Helper function to properly quote metadata values
function quoteMetadataValue(value) {
  if (!value) return '';
  // Escape single quotes and wrap in single quotes
  return `'${value.replace(/'/g, "'\\''")}'`;
}

async function getReleaseData(releasePath) {
  try {
    const data = await fs.promises.readFile(releasePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading release data for ${releasePath}:`, error);
    stats.errors++;
    return null;
  }
}

async function setTrackMetadata(trackData, releaseData, releaseDir) {
  const decodedAudioFile = decodeURIComponent(trackData.audio_file);
  const audioFile = path.join(releaseDir, decodedAudioFile);
  
  try {
    // Enhanced file checks
    console.log(`\nProcessing file: ${audioFile}`);
    
    // Check if file exists
    try {
      await fs.promises.access(audioFile, fs.constants.R_OK);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Audio file not found: ${audioFile}`);
      } else if (error.code === 'EACCES') {
        throw new Error(`No permission to read audio file: ${audioFile}`);
      } else {
        throw new Error(`Error accessing audio file: ${error.message}`);
      }
    }

    // Get file stats for additional checks
    const stats = await fs.promises.stat(audioFile);
    if (stats.size === 0) {
      throw new Error(`Audio file is empty: ${audioFile}`);
    }
    
    console.log(`File size: ${stats.size} bytes`);
    console.log(`File permissions: ${stats.mode.toString(8)}`);
    
    // Get artist name
    const artist = trackData.artist || 
                  releaseData.track_artist || 
                  releaseData.track_artists?.[0] || 
                  releaseData.release_artist || 
                  releaseData.release_artists?.[0] || '';

    // Get year from date
    const year = releaseData.date ? new Date(releaseData.date).getFullYear().toString() : undefined;

    // Get genre tags
    const genre = releaseData.tags ? releaseData.tags.join('; ') : '';

    // Get track number from position in array
    const trackNumber = (releaseData.tracks.findIndex(t => t.audio_file === trackData.audio_file) + 1).toString();
    const totalTracks = releaseData.tracks.length.toString();

    // Create a temporary file in the same directory as the original file
    const audioExt = path.extname(audioFile);
    const audioBaseName = path.basename(audioFile, audioExt);
    const tempFile = path.join(path.dirname(audioFile), `${audioBaseName}_temp${audioExt}`);

    // Update metadata using ffmpeg with quoted values
    await new Promise((resolve, reject) => {
      // Log FFmpeg path and version
      const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
      console.log(`Using FFmpeg path: ${ffmpegPath}`);
      
      const command = ffmpeg(quoteMetadataValue(audioFile))
        .outputOptions([
          '-y', // Force overwrite
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
        .on('start', (commandLine) => {
          console.log(`Running command: ${commandLine}`);
          // Log the actual file paths being used
          console.log(`Input file: ${audioFile}`);
          console.log(`Output file: ${tempFile}`);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        })
        .on('end', () => {
          try {
            // Replace original file with the new one
            fs.renameSync(tempFile, audioFile);
            resolve();
          } catch (error) {
            reject(new Error(`Failed to replace file: ${error.message}`));
          }
        })
        .on('error', (err) => {
          // Clean up temp file if it exists
          try {
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
          } catch (cleanupError) {
            console.error('Failed to clean up temp file:', cleanupError);
          }
          reject(err);
        });

      // Set ffmpeg path if needed
      if (process.env.FFMPEG_PATH) {
        command.setFfmpegPath(process.env.FFMPEG_PATH);
      }

      // Add debug logging
      command.on('stderr', (stderrLine) => {
        console.log('FFmpeg stderr:', stderrLine);
      });

      command.run();
    });
    
    console.log(`✓ Updated metadata for track: ${trackData.title}`);
    stats.processed++;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠ Skipping track ${trackData.title} - audio file not found: ${decodedAudioFile}`);
      stats.skipped++;
    } else {
      console.error(`✗ Error setting metadata for track ${trackData.title}:`, error.message);
      console.error(`File path: ${audioFile}`);
      if (error.stderr) {
        console.error('FFmpeg error details:', error.stderr);
      }
      stats.errors++;
    }
  }
}

async function processRelease(releasePath) {
  const releaseData = await getReleaseData(releasePath);
  if (!releaseData || !releaseData.tracks) {
    console.log('⚠ No tracks found in release or invalid release data');
    stats.skipped++;
    return;
  }

  const releaseDir = path.dirname(releasePath);
  let hasAudioFiles = false;
  
  console.log(`\nProcessing release: ${releaseData.title}`);
  console.log(`Release date: ${releaseData.date}`);
  console.log(`Artist: ${releaseData.release_artist || releaseData.release_artists?.[0] || 'Unknown'}`);
  console.log(`Tracks: ${releaseData.tracks.length}`);
  
  for (const track of releaseData.tracks) {
    if (track.audio_file) {
      hasAudioFiles = true;
      await setTrackMetadata(track, releaseData, releaseDir);
    }
  }
  
  if (!hasAudioFiles) {
    console.log(`⚠ Skipping release ${releaseData.title} - no audio files found`);
    stats.skipped++;
  } else {
    console.log(`✓ Finished processing release: ${releaseData.title}`);
  }
}

async function processAllReleases() {
  console.log('Starting metadata update process...\n');
  
  try {
    // Get all catalog directories
    const catalogDirs = await fs.promises.readdir(path.join(CONTENT_DIR, 'catalogs'));
    stats.catalogs = catalogDirs.length;
    
    console.log(`Found ${catalogDirs.length} catalogs`);
    
    for (const catalogDir of catalogDirs) {
      console.log(`\nProcessing catalog: ${catalogDir}`);
      const releasesDir = path.join(CONTENT_DIR, 'catalogs', catalogDir, 'releases');
      
      try {
        const releaseDirs = await fs.promises.readdir(releasesDir);
        stats.releases += releaseDirs.length;
        
        console.log(`Found ${releaseDirs.length} releases`);
        
        for (const releaseDir of releaseDirs) {
          const releasePath = path.join(releasesDir, releaseDir, 'release.json');
          await processRelease(releasePath);
        }
      } catch (error) {
        console.error(`✗ Error processing catalog ${catalogDir}:`, error);
        stats.errors++;
      }
    }
    
    // Print final statistics
    console.log('\n=== Processing Complete ===');
    console.log(`Catalogs processed: ${stats.catalogs}`);
    console.log(`Releases found: ${stats.releases}`);
    console.log(`Tracks processed: ${stats.processed}`);
    console.log(`Tracks skipped: ${stats.skipped}`);
    console.log(`Errors encountered: ${stats.errors}`);
    
  } catch (error) {
    console.error('✗ Error processing releases:', error);
    stats.errors++;
  }
}

// Run the script
processAllReleases(); 