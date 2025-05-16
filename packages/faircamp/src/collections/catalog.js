const merge = require('lodash.merge');

const base = {
  name: 'catalogs',
  label: 'Catalogs',
  folder: 'content/catalogs',
  create: true,
  path: '{{slug}}/catalog',
  format: 'json',
  fields: [
    { label: 'Title', name: 'title', widget: 'string', required: true, hint: 'The over-all title of your site, which appears in the header, footer, inside the RSS Feed, etc.' },
    { label: 'Base URL', name: 'base_url', widget: 'string', required: false, hint: 'The website URL under which your faircamp site will go online. Required for embeds, M3U playlists and feeds.' },
    { label: 'Language', name: 'language', widget: 'string', required: true, default: 'en', hint: 'The primary language of your catalog (e.g., en, fr, es)' },
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
    { label: 'Cache Optimization', name: 'cache_optimization', widget: 'select', options: ['delayed', 'immediate', 'wipe', 'manual'], default: 'delayed', hint: 'Advanced control over caching strategy for build artifacts' },
    { label: 'Copy Link', name: 'copy_link', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Controls whether the "Copy link" button is enabled' },
    { label: 'Download Code', name: 'download_code', widget: 'string', required: false, hint: 'Single download code for accessing downloads' },
    { label: 'Download Codes', name: 'download_codes', widget: 'list', required: false, hint: 'Multiple download codes for accessing downloads' },
    { label: 'Embedding', name: 'embedding', widget: 'select', options: ['enabled', 'disabled'], default: 'disabled', hint: 'Controls whether external sites can embed a widget with music from your site' },
    { label: 'Faircamp Signature', name: 'faircamp_signature', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Show the "Powered by Faircamp" signature in the footer' },
    { label: 'Favicon', name: 'favicon', widget: 'image', required: false, hint: 'Custom favicon for your site (supports .png and .ico files)' },
    { label: 'Feature Support Artists', name: 'feature_support_artists', widget: 'boolean', default: false, hint: 'Link to support artists and give them their own pages (label mode only)' },
    {
      label: 'Feeds',
      name: 'feeds',
      widget: 'select',
      multiple: true,
      dropdown_threshold: 0,
      options: ['generic_rss', 'media_rss', 'podcast_rss', 'atom', 'all', 'disabled'],
      required: false,
      hint: 'Select which feeds to generate for your catalog'
    },
    { label: 'Freeze Download URLs', name: 'freeze_download_urls', widget: 'boolean', default: false, hint: 'Prevent download URLs from changing between builds' },
    {
      label: 'Home Image',
      name: 'home_image',
      widget: 'object',
      required: false,
      hint: 'The main image displayed on your catalog\'s home page',
      fields: [
        { label: 'Description', name: 'description', widget: 'string', required: true, hint: 'Alt text description for the image' },
        { label: 'File', name: 'file', widget: 'image', required: true, hint: 'The image file' }
      ]
    },
    { label: 'Label Mode', name: 'label_mode', widget: 'boolean', default: false, hint: 'Enable this if you\'re managing a record label catalog' },
    {
      label: 'Link',
      name: 'link',
      widget: 'object',
      required: false,
      hint: 'Add a link to your social media, website, etc.',
      fields: [
        { label: 'URL', name: 'url', widget: 'string', required: true, hint: 'The full URL of the link' },
        { label: 'Label', name: 'label', widget: 'string', required: false, hint: 'The text to display for this link' }
      ]
    },
    { label: 'M3U', name: 'm3u', widget: 'select', options: ['catalog', 'disabled', 'enabled', 'releases'], default: 'disabled', dropdown_threshold: 0, hint: 'Controls M3U playlist generation' },
    { label: 'More', name: 'more', widget: 'markdown', required: false, hint: 'Detailed information about the catalog in Markdown format' },
    { label: 'More Label', name: 'more_label', widget: 'string', required: false, hint: 'Custom text for the "More" button (defaults to "More")' },
    {
      label: 'OpenGraph',
      name: 'opengraph',
      widget: 'object',
      required: false,
      hint: 'Configure OpenGraph metadata for social media sharing',
      fields: [
        { label: 'Title', name: 'title', widget: 'string', required: false, hint: 'Custom title for social media sharing' },
        { label: 'Description', name: 'description', widget: 'text', required: false, hint: 'Custom description for social media sharing' },
        { label: 'Image', name: 'image', widget: 'image', required: false, hint: 'Custom image for social media sharing' }
      ]
    },
    { label: 'Payment Info', name: 'payment_info', widget: 'text', required: false, hint: 'Text displayed with the code input field or paycurtain' },
    { label: 'Release Download Access', name: 'release_download_access', widget: 'select', options: ['free', 'code', 'paycurtain', 'disabled'], required: false, hint: 'Controls how visitors can access release downloads' },
    { label: 'Release Downloads', name: 'release_downloads', widget: 'select', multiple: true, options: ['aac', 'aiff', 'alac', 'flac', 'mp3', 'ogg_vorbis', 'opus', 'opus_48', 'opus_96', 'opus_128', 'wav'], required: false, hint: 'Formats in which releases can be downloaded' },
    { label: 'Release Extras', name: 'release_extras', widget: 'select', options: ['bundled', 'disabled', 'separate'], required: false, hint: 'Controls how release extras are handled' },
    { label: 'Release Price', name: 'release_price', widget: 'string', required: false, hint: 'Price for release downloads when using paycurtain' },
    { label: 'Rotate Download URLs', name: 'rotate_download_urls', widget: 'boolean', default: false, hint: 'Change download URLs between builds' },
    { label: 'Show Support Artists', name: 'show_support_artists', widget: 'boolean', default: false, hint: 'Show support artists in listings' },
    { label: 'Site Assets', name: 'site_assets', widget: 'text', required: false, hint: 'Additional assets to be included in the site' },
    { label: 'Site Metadata', name: 'site_metadata', widget: 'text', required: false, hint: 'Additional HTML content to be included in the head section of all pages' },
    { label: 'Speed Controls', name: 'speed_controls', widget: 'select', options: ['enabled', 'disabled'], default: 'enabled', hint: 'Whether to show playback speed controls' },
    { label: 'Streaming Quality', name: 'streaming_quality', widget: 'select', options: ['standard', 'frugal'], required: false, hint: 'Default streaming quality for audio' },
    { label: 'Synopsis', name: 'synopsis', widget: 'text', required: false, hint: 'A short description of the catalog' },
    { label: 'Tags', name: 'tags', widget: 'select', options: ['copy', 'normalize', 'remove'], required: false, hint: 'How to handle tags for this catalog' },
    {
      label: 'Theme',
      name: 'theme',
      widget: 'object',
      hint: 'Customize the appearance of the catalog',
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
    { label: 'Track Numbering', name: 'track_numbering', widget: 'select', options: ['arabic', 'arabic-dotted', 'arabic-padded', 'disabled', 'hexadecimal', 'hexadecimal-padded', 'roman', 'roman-dotted'], default: 'arabic-dotted', required: false, hint: 'Style used for track numbering' },
    { label: 'Track Price', name: 'track_price', widget: 'string', required: false, hint: 'Price for track downloads when using paycurtain' },
    { label: 'Unlock Info', name: 'unlock_info', widget: 'text', required: false, hint: 'Text displayed when prompting for a download code' }
  ]
};

function Catalog(overrides = {}) {
  return merge({}, base, overrides);
}

module.exports = Catalog; 