const merge = require('lodash.merge');

const base = {
  name: 'releases',
  label: 'Releases',
  folder: 'content',
  create: true,
  format: 'json',
  identifier_field: 'slug',
  summary: '{{title}}',
  path: 'catalogs/{{catalog}}/releases/{{slug}}/release',
  media_folder: '',
  public_folder: '',
  fields: [
    { label: 'Title', name: 'title', widget: 'string', required: true, hint: 'The title of the release' },
    { label: 'Catalog', name: 'catalog', widget: 'relation', collection: 'catalogs', search_fields: ['title'], display_fields: ['title'], required: true, dropdown_threshold: 0, hint: 'The catalog this release belongs to' },
    { label: 'Date', name: 'date', widget: 'datetime', format: 'YYYY-MM-DD', required: true, hint: 'The release date (YYYY-MM-DD format)' },
    { label: 'Synopsis', name: 'synopsis', widget: 'text', required: false, hint: 'A short description of the release' },
    { label: 'More', name: 'more', widget: 'markdown', required: false, hint: 'Detailed information about the release in Markdown format' },
    { label: 'More Label', name: 'more_label', widget: 'string', required: false, hint: 'Custom text for the "More" button (defaults to "More")' },
    { label: 'Release Artist', name: 'release_artist', widget: 'string', required: false, hint: 'Single main artist for the release' },
    { label: 'Release Artists', name: 'release_artists', widget: 'list', required: false, hint: 'Multiple main artists for the release' },
    { label: 'Track Artist', name: 'track_artist', widget: 'string', required: false, hint: 'Single main artist for the tracks' },
    { label: 'Track Artists', name: 'track_artists', widget: 'list', required: false, hint: 'Multiple main artists for the tracks' },
    { label: 'Permalink', name: 'permalink', widget: 'string', required: false, hint: 'Custom URL path for the release page' },
    { label: 'Unlisted', name: 'unlisted', widget: 'boolean', default: false, hint: 'Hide this release from public listings while keeping the page accessible' },
    { label: 'Copy Link', name: 'copy_link', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Controls whether the "Copy link" button is enabled' },
    { label: 'Embedding', name: 'embedding', widget: 'select', options: ['enabled', 'disabled'], default: 'disabled', hint: 'Controls whether external sites can embed a widget with music from your site' },
    { label: 'Speed Controls', name: 'speed_controls', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Whether to show playback speed controls' },
    { label: 'M3U', name: 'm3u', widget: 'select', options: ['enabled', 'disabled'], default: 'disabled', hint: 'Controls whether to generate an M3U playlist for the release' },
    { label: 'Track Numbering', name: 'track_numbering', widget: 'select', options: ['arabic', 'arabic-dotted', 'arabic-padded', 'disabled', 'hexadecimal', 'hexadecimal-padded', 'roman', 'roman-dotted'], default: 'arabic-dotted', hint: 'Style used for track numbering' },
    {
      label: 'Cover',
      name: 'cover',
      widget: 'object',
      required: false,
      hint: 'The release cover image',
      fields: [
        { label: 'Description', name: 'description', widget: 'string', required: true, hint: 'Alt text description for the image' },
        { label: 'File', name: 'file', widget: 'image', required: true, hint: 'The image file' }
      ]
    },
    {
      label: 'Artist',
      name: 'artist',
      widget: 'object',
      required: false,
      hint: 'Shortcut to define artists without creating an explicit artist directory',
      fields: [
        { label: 'Name', name: 'name', widget: 'string', required: true, hint: 'The name of the artist' },
        { label: 'External Page', name: 'external_page', widget: 'string', required: false, hint: 'URL to the artist\'s external website' },
        { label: 'Alias', name: 'alias', widget: 'string', required: false, hint: 'Alternative name for the artist' },
        { label: 'Permalink', name: 'permalink', widget: 'string', required: false, hint: 'Custom URL path for the artist\'s page' }
      ]
    },
    { label: 'Download Code', name: 'download_code', widget: 'string', required: false, hint: 'Single download code for accessing downloads' },
    { label: 'Download Codes', name: 'download_codes', widget: 'list', required: false, hint: 'Multiple download codes for accessing downloads' },
    {
      label: 'Link',
      name: 'link',
      widget: 'object',
      required: false,
      hint: 'Add a link to streaming services, stores, etc.',
      fields: [
        { label: 'URL', name: 'url', widget: 'string', required: true, hint: 'The full URL of the link' },
        { label: 'Label', name: 'label', widget: 'string', required: false, hint: 'The text to display for this link' }
      ]
    },
    { label: 'Payment Info', name: 'payment_info', widget: 'text', required: false, hint: 'Text displayed with the code input field or paycurtain' },
    { label: 'Release Download Access', name: 'release_download_access', widget: 'select', options: ['free', 'code', 'paycurtain', 'disabled'], required: false, hint: 'Controls how visitors can access release downloads' },
    { label: 'Release Downloads', name: 'release_downloads', widget: 'select', multiple: true, options: ['aac', 'aiff', 'alac', 'flac', 'mp3', 'ogg_vorbis', 'opus', 'opus_48', 'opus_96', 'opus_128', 'wav'], required: false, hint: 'Formats in which releases can be downloaded' },
    { label: 'Release Extras', name: 'release_extras', widget: 'select', options: ['bundled', 'disabled', 'separate'], required: false, hint: 'Controls how release extras are handled' },
    { label: 'Release Price', name: 'release_price', widget: 'string', required: false, hint: 'Price for release downloads when using paycurtain' },
    { label: 'Streaming Quality', name: 'streaming_quality', widget: 'select', options: ['standard', 'frugal'], required: false, hint: 'Default streaming quality for audio' },
    { label: 'Tags', name: 'tags', widget: 'select', options: ['copy', 'normalize', 'remove'], required: false, hint: 'How to handle tags for this release' },
    {
      label: 'Theme',
      name: 'theme',
      widget: 'object',
      hint: 'Customize the appearance of the release page',
      fields: [
        { label: 'Accent Brightening', name: 'accent_brightening', widget: 'number', min: 0, max: 100, required: false, hint: 'Brightness adjustment for accent colors (0-100)' },
        { label: 'Accent Chroma', name: 'accent_chroma', widget: 'number', min: 0, max: 100, required: false, hint: 'Color intensity for accent colors (0-100)' },
        { label: 'Accent Hue', name: 'accent_hue', widget: 'number', min: 0, max: 360, required: false, hint: 'Hue angle for accent colors (0-360)' },
        { label: 'Base', name: 'base', widget: 'select', options: ['light', 'dark'], required: false, hint: 'Base theme (light or dark)' },
        { label: 'Base Chroma', name: 'base_chroma', widget: 'number', min: 0, max: 100, required: false, hint: 'Color intensity for base colors (0-100)' },
        { label: 'Base Hue', name: 'base_hue', widget: 'number', min: 0, max: 360, required: false, hint: 'Hue angle for base colors (0-360)' },
        { label: 'Background Alpha', name: 'background_alpha', widget: 'number', min: 0, max: 100, required: false, hint: 'Opacity of the background image (0-100)' },
        { label: 'Background Image', name: 'background_image', widget: 'image', required: false, hint: 'Background image for the page' },
        { label: 'Round Corners', name: 'round_corners', widget: 'select', options: ['enabled', 'disabled'], required: false, hint: 'Whether to round corners on release covers' },
        { label: 'Waveforms', name: 'waveforms', widget: 'select', options: ['absolute', 'relative', 'disabled'], required: false, hint: 'Controls waveform display behavior' },
        { label: 'System Font', name: 'system_font', widget: 'select', options: ['sans', 'mono'], required: false, hint: 'System font to use for the site' }
      ]
    },
    { label: 'Track Download Access', name: 'track_download_access', widget: 'select', options: ['free', 'code', 'paycurtain', 'disabled'], required: false, hint: 'Controls how visitors can access track downloads' },
    { label: 'Track Downloads', name: 'track_downloads', widget: 'select', multiple: true, options: ['aac', 'aiff', 'alac', 'flac', 'mp3', 'ogg_vorbis', 'opus', 'opus_48', 'opus_96', 'opus_128', 'wav'], required: false, hint: 'Formats in which tracks can be downloaded' },
    { label: 'Track Extras', name: 'track_extras', widget: 'select', options: ['enabled', 'disabled'], required: false, hint: 'Controls whether track extras are offered as downloads' },
    { label: 'Track Price', name: 'track_price', widget: 'string', required: false, hint: 'Price for track downloads when using paycurtain' },
    { label: 'Unlock Info', name: 'unlock_info', widget: 'text', required: false, hint: 'Text displayed when prompting for a download code' },
    {
      label: 'Tracks',
      name: 'tracks',
      widget: 'list',
      required: false,
      hint: 'Add tracks to this release',
      fields: [
        { label: 'Title', name: 'title', widget: 'string', required: true, hint: 'The title of the track' },
        { label: 'Artist', name: 'artist', widget: 'string', required: false, hint: 'The artist for this track' },
        { label: 'Description', name: 'description', widget: 'text', required: false, hint: 'Additional information about the track' },
        { label: 'Audio File', name: 'audio_file', widget: 'file', required: true, hint: 'The audio file for this track (supported formats: mp3, ogg, wav, flac)', accept: 'audio/*' }
      ]
    }
  ]
};

function Release(overrides = {}) {
  return merge({}, base, overrides);
}

module.exports = Release; 