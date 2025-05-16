const merge = require('lodash.merge');

const base = {
  name: 'artists',
  label: 'Artists',
  folder: 'content/artists',
  create: true,
  format: 'json',
  identifier_field: 'slug',
  summary: '{{name}}',
  path: '{{slug}}/artist',
  media_folder: '',
  public_folder: '',
  fields: [
    { label: 'Name', name: 'name', widget: 'string', required: true, hint: 'The artist\'s primary name' },
    { label: 'Slug', name: 'slug', widget: 'string', required: true, hint: 'URL-friendly version of the name (e.g., "artist-name")' },
    { label: 'Alias', name: 'alias', widget: 'string', required: false, hint: 'An alternative name for the artist' },
    { label: 'Aliases', name: 'aliases', widget: 'list', required: false, hint: 'List of additional alternative names for the artist' },
    { label: 'Copy Link', name: 'copy_link', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Controls whether the "Copy link" button is enabled' },
    { label: 'Download Code', name: 'download_code', widget: 'string', required: false, hint: 'Single download code for accessing downloads' },
    { label: 'Download Codes', name: 'download_codes', widget: 'list', required: false, hint: 'Multiple download codes for accessing downloads' },
    { label: 'Embedding', name: 'embedding', widget: 'select', options: ['enabled', 'disabled'], default: 'disabled', hint: 'Controls whether external sites can embed a widget with music from your site' },
    { label: 'External Page', name: 'external_page', widget: 'string', required: false, hint: 'URL to the artist\'s external website or social media page' },
    {
      label: 'Image',
      name: 'image',
      widget: 'object',
      required: false,
      hint: 'Artist\'s profile image',
      fields: [
        { label: 'Description', name: 'description', widget: 'string', required: true, hint: 'Alt text description for the image' },
        { label: 'File', name: 'file', widget: 'image', required: true, hint: 'The image file (recommended size: 800x800 pixels)' }
      ]
    },
    {
      label: 'Link',
      name: 'link',
      widget: 'object',
      required: false,
      hint: 'Add a link to the artist\'s social media, website, etc.',
      fields: [
        { label: 'URL', name: 'url', widget: 'string', required: true, hint: 'The full URL of the link' },
        { label: 'Label', name: 'label', widget: 'string', required: false, hint: 'The text to display for this link' },
        { label: 'Verification', name: 'verification', widget: 'select', options: ['rel-me', 'rel-me-hidden'], required: false, hint: 'Configure rel="me" linking for verification' }
      ]
    },
    { label: 'M3U', name: 'm3u', widget: 'boolean', default: false, hint: 'Generate an M3U playlist for the artist' },
    { label: 'More', name: 'more', widget: 'markdown', required: false, hint: 'Detailed information about the artist in Markdown format' },
    { label: 'More Label', name: 'more_label', widget: 'string', required: false, hint: 'Custom text for the "More" button (defaults to "More")' },
    { label: 'Payment Info', name: 'payment_info', widget: 'text', required: false, hint: 'Text displayed with the code input field or paycurtain' },
    { label: 'Permalink', name: 'permalink', widget: 'string', required: false, hint: 'Custom URL path for the artist\'s page' },
    { label: 'Release Download Access', name: 'release_download_access', widget: 'select', options: ['free', 'code', 'paycurtain', 'disabled'], required: false, hint: 'Controls how visitors can access release downloads' },
    { label: 'Release Downloads', name: 'release_downloads', widget: 'select', multiple: true, options: ['aac', 'aiff', 'alac', 'flac', 'mp3', 'ogg_vorbis', 'opus', 'opus_48', 'opus_96', 'opus_128', 'wav'], required: false, hint: 'Formats in which releases can be downloaded' },
    { label: 'Release Extras', name: 'release_extras', widget: 'select', options: ['bundled', 'disabled', 'separate'], required: false, hint: 'Controls how release extras are handled' },
    { label: 'Release Price', name: 'release_price', widget: 'string', required: false, hint: 'Price for release downloads when using paycurtain' },
    { label: 'Speed Controls', name: 'speed_controls', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Whether to show playback speed controls' },
    { label: 'Streaming Quality', name: 'streaming_quality', widget: 'select', options: ['standard', 'frugal'], required: false, hint: 'Default streaming quality for audio' },
    { label: 'Synopsis', name: 'synopsis', widget: 'text', required: false, hint: 'A short description of the artist' },
    { label: 'Tags', name: 'tags', widget: 'select', options: ['copy', 'normalize', 'remove'], required: false, hint: 'How to handle tags for this artist' },
    {
      label: 'Theme',
      name: 'theme',
      widget: 'object',
      hint: 'Customize the appearance of the artist\'s page',
      fields: [
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
    { label: 'Track Numbering', name: 'track_numbering', widget: 'select', options: ['arabic', 'arabic-dotted', 'arabic-padded', 'disabled', 'hexadecimal', 'hexadecimal-padded', 'roman', 'roman-dotted'], default: 'arabic-dotted', required: false, hint: 'Style used for track numbering' },
    { label: 'Track Price', name: 'track_price', widget: 'string', required: false, hint: 'Price for track downloads when using paycurtain' },
    { label: 'Unlock Info', name: 'unlock_info', widget: 'text', required: false, hint: 'Text displayed when prompting for a download code' },
    { label: 'Unlisted', name: 'unlisted', widget: 'boolean', default: false, hint: 'Hide this artist from public listings while keeping the page accessible' }
  ]
};

function Artist(overrides = {}) {
  return merge({}, base, overrides);
}

module.exports = Artist; 