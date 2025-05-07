const { getConfig } = require('..');

describe('getConfig', () => {
  it('returns the default config when no overrides are provided', () => {
    const config = getConfig();
    expect(config).toEqual({
      mediaFolder: 'static/media/uploads',
      publicFolder: '/media/uploads',
      locale: 'en',
    });
  });

  it('applies overrides to the default config', () => {
    const config = getConfig({ locale: 'fr', mediaFolder: 'custom/media' });
    expect(config).toEqual({
      mediaFolder: 'custom/media',
      publicFolder: '/media/uploads',
      locale: 'fr',
    });
  });

  it('returns a new object each time', () => {
    const config1 = getConfig();
    const config2 = getConfig({ locale: 'es' });
    expect(config1).not.toBe(config2);
  });
}); 