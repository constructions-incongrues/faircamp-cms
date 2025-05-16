import { Catalog, Artist, Release, Track } from '../collections/index.js';

/**
 * Default configuration
 * @type {FaircampConfig}
 */
const sveltiaCmsConfig = {
    media_folder: 'static/media/uploads',
    public_folder: '/media/uploads',
    locale: 'en',
    load_config_file: false,
    backend: {
        name: 'github',
        repo: 'faircamp/faircamp-cms-starter',
        branch: 'main',
    },
    collections: [
        Catalog(),
        Artist(),
        Release(),
        Track(),
    ]
};

export default sveltiaCmsConfig;