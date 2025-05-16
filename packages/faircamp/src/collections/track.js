const merge = require('lodash.merge');

const base = {
  name: 'tracks',
  label: 'Tracks',
  folder: 'content/tracks',
  create: true,
  format: 'json',
  identifier_field: 'slug',
  summary: '{{title}}',
  path: '{{slug}}/track',
  media_folder: '',
  public_folder: '',
  fields: [
    { label: 'Title', name: 'title', widget: 'string', required: true, hint: 'The title of the track' },
    { label: 'Audio File', name: 'audio_file', widget: 'file', required: true, hint: 'The audio file for this track (supported formats: mp3, ogg, wav, flac)', accept: 'audio/*' },
    { label: 'Slug', name: 'slug', widget: 'string', required: true, hint: 'URL-friendly version of the title (e.g., "track-title")' },
    { label: 'Track Artist', name: 'track_artist', widget: 'string', required: false, hint: 'The main artist for this track' },
    { label: 'Track Artists', name: 'track_artists', widget: 'list', required: false, hint: 'List of all artists involved in this track' },
    { label: 'Copy Link', name: 'copy_link', widget: 'boolean', default: false, hint: 'Show a button to copy the track\'s URL' },
    { label: 'Download Code', name: 'download_code', widget: 'string', required: false, hint: 'Single download code for this track' },
    { label: 'Download Codes', name: 'download_codes', widget: 'list', required: false, hint: 'Multiple download codes for this track' },
    { label: 'Embedding', name: 'embedding', widget: 'boolean', default: false, hint: 'Allow this track to be embedded on other websites' },
    {
      label: 'Link',
      name: 'link',
      widget: 'object',
      hint: 'Add a link to streaming services, stores, etc.',
      fields: [
        { label: 'URL', name: 'url', widget: 'string', required: false, hint: 'The full URL of the link' },
        { label: 'Label', name: 'label', widget: 'string', required: false, hint: 'The text to display for this link' }
      ]
    },
    { label: 'More', name: 'more', widget: 'markdown', required: false, hint: 'Detailed information about the track in Markdown format' },
    { label: 'More Label', name: 'more_label', widget: 'string', required: false, hint: 'Custom text for the "More" button (defaults to "More")' },
    { label: 'Payment Info', name: 'payment_info', widget: 'text', required: false, hint: 'Information about payment methods or requirements' },
    { label: 'Speed Controls', name: 'speed_controls', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Whether to show playback speed controls in the audio player' },
    { label: 'Streaming Quality', name: 'streaming_quality', widget: 'select', options: ['standard', 'frugal'], default: 'standard', hint: 'The quality of the streaming audio' },
    { label: 'Synopsis', name: 'synopsis', widget: 'text', required: false, hint: 'A short description of the track' },
    { label: 'Tags', name: 'tags', widget: 'select', options: ['copy', 'normalize', 'remove'], required: false, hint: 'How to handle tags for this track' },
    {
      label: 'Track Download Access',
      name: 'track_download_access',
      widget: 'object',
      hint: 'Configure how users can access downloads for this track',
      fields: [
        { label: 'Type', name: 'type', widget: 'select', options: ['free', 'code', 'paycurtain', 'external', 'disabled'], required: true, hint: 'The type of download access to provide' },
        { label: 'Code', name: 'code', widget: 'string', required: false, hint: 'The download code for "code" type access' },
        { label: 'URL', name: 'url', widget: 'string', required: false, hint: 'The external URL for "paycurtain" or "external" type access' }
      ]
    },
    {
      label: 'Track Downloads',
      name: 'track_downloads',
      widget: 'select',
      multiple: true,
      options: ['mp3', 'ogg', 'opus', 'flac', 'wav'],
      required: false,
      hint: 'Select the audio formats available for download'
    },
    {
      label: 'Track Extras',
      name: 'track_extras',
      widget: 'object',
      hint: 'Configure how additional files (artwork, lyrics, etc.) are handled',
      fields: [
        { label: 'Bundled', name: 'bundled', widget: 'boolean', default: false, hint: 'Include extra files in the main download archive' },
        { label: 'Separate', name: 'separate', widget: 'boolean', default: false, hint: 'Offer extra files as separate downloads' }
      ]
    },
    { label: 'Track Price', name: 'track_price', widget: 'string', required: false, hint: 'The price for this track (if applicable)' },
    { label: 'Unlock Info', name: 'unlock_info', widget: 'text', required: false, hint: 'Information about how to unlock or purchase this track' },
    {
      label: 'Theme',
      name: 'theme',
      widget: 'object',
      hint: 'Customize the appearance of the track page',
      fields: [
        { label: 'Name', name: 'name', widget: 'string', required: false, hint: 'Name of the theme to use' },
        { label: 'Custom CSS', name: 'custom_css', widget: 'text', required: false, hint: 'Additional CSS styles for this track\'s page' }
      ]
    }
  ]
};

function Track(overrides = {}) {
  return merge({}, base, overrides);
}

module.exports = Track; 