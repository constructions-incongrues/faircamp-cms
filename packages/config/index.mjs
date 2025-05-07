// Shared configuration for faircamp-cms
import { Catalog, Artist, Release, Track } from '@constructions-incongrues/faircamp-cms-collections';

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

let getConfig = function (overrides = {}) {
  return { ...defaultConfig, ...overrides };
};

export function setConfigProvider(fn) {
  if (typeof fn === 'function') {
    getConfig = fn;
  }
}

export { getConfig };
export default getConfig;