// Shared configuration for faircamp-cms
import { Catalog, Artist, Release, Track } from '@faircamp-cms/collections';

const defaultConfig = {
  media_folder: 'static/media/uploads',
  public_folder: '/media/uploads',
  locale: 'en',
  load_config_file: false,
  backend: {
    name: 'github',
    repo: 'faircamp/faircamp-cms',
    branch: 'main',
  },
  collections: [
    Catalog(),
    Artist(),
    Release(),
    Track(),
  ]
};

export function getConfig(overrides = {}) {
  return { ...defaultConfig, ...overrides };
}