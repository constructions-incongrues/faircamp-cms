const { Catalog, Artist, Release, Track } = require('..');

describe('Collections', () => {
  test('Catalog returns default schema', () => {
    const schema = Catalog();
    expect(schema).toHaveProperty('name', 'catalogs');
    expect(Array.isArray(schema.fields)).toBe(true);
  });

  test('Catalog override works', () => {
    const schema = Catalog({ label: 'Custom Catalog' });
    expect(schema.label).toBe('Custom Catalog');
    expect(schema.name).toBe('catalogs');
  });

  test('Artist returns default schema', () => {
    const schema = Artist();
    expect(schema).toHaveProperty('name', 'artists');
    expect(Array.isArray(schema.fields)).toBe(true);
  });

  test('Release returns default schema', () => {
    const schema = Release();
    expect(schema).toHaveProperty('name', 'releases');
    expect(Array.isArray(schema.fields)).toBe(true);
  });

  test('Track returns default schema', () => {
    const schema = Track();
    expect(schema).toHaveProperty('name', 'tracks');
    expect(Array.isArray(schema.fields)).toBe(true);
  });

  test('Track override works', () => {
    const schema = Track({ label: 'Custom Track' });
    expect(schema.label).toBe('Custom Track');
    expect(schema.name).toBe('tracks');
  });
}); 