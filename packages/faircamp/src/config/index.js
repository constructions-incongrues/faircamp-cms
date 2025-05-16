/**
 * Config module
 * Provides configuration utilities for Faircamp CMS
 * @module faircamp/config
 */

/**
 * @typedef {Object} FaircampConfig
 * @property {string} media_folder - Media folder path
 * @property {string} public_folder - Public folder path
 * @property {string} locale - Locale code
 * @property {Object} backend - Backend configuration
 * @property {Array} collections - Collection schemas
 */

import sveltiaCmsConfig from './sveltia-cms.js';

/**
 * Store for named configurations
 * @type {Object.<string, FaircampConfig>}
 */
const configStore = {
  sveltiaCms: sveltiaCmsConfig
};

/**
 * Active configuration name
 * @type {string}
 */
let activeConfig = 'sveltiaCms';

/**
 * Get the currently active configuration name
 * @returns {string} The active configuration name
 */
export function getActiveConfigName() {
  return activeConfig;
}

/**
 * Set the active configuration by name
 * @param {string} configName - Name of the configuration to activate
 * @returns {boolean} True if successful, false if the configuration doesn't exist
 */
export function setActiveConfig(configName) {
  if (configStore[configName]) {
    activeConfig = configName;
    return true;
  }
  return false;
}

/**
 * Register a new named configuration
 * @param {string} name - The configuration name
 * @param {Object} config - The configuration object
 * @param {boolean} [makeActive=false] - Whether to make this the active configuration
 * @returns {boolean} True if successful, false if a configuration with this name already exists
 */
export function registerConfig(name, config, makeActive = false) {
  if (configStore[name]) {
    return false;
  }

  configStore[name] = { ...defaultConfig, ...config };

  if (makeActive) {
    activeConfig = name;
  }

  return true;
}

/**
 * Update an existing named configuration
 * @param {string} name - The configuration name
 * @param {Object} configUpdates - The configuration updates to apply
 * @returns {boolean} True if successful, false if the configuration doesn't exist
 */
export function updateConfig(name, configUpdates) {
  if (!configStore[name]) {
    return false;
  }

  configStore[name] = { ...configStore[name], ...configUpdates };
  return true;
}

/**
 * Delete a named configuration
 * @param {string} name - The configuration name
 * @returns {boolean} True if successful, false if the configuration doesn't exist or is the default
 */
export function deleteConfig(name) {
  if (name === 'default' || !configStore[name]) {
    return false;
  }

  delete configStore[name];

  if (activeConfig === name) {
    activeConfig = 'default';
  }

  return true;
}

/**
 * Get a named configuration
 * @param {string} name - The configuration name
 * @returns {FaircampConfig|null} The configuration object, or null if not found
 */
export function getNamedConfig(name) {
  return configStore[name] || null;
}

/**
 * List all available configuration names
 * @returns {string[]} Array of configuration names
 */
export function listConfigs() {
  return Object.keys(configStore);
}

/**
 * Get the configuration with optional overrides
 * @param {Object} [overrides={}] - Optional configuration overrides
 * @returns {FaircampConfig} The merged configuration
 */
export function getConfig(overrides = {}) {
  return { ...configStore[activeConfig], ...overrides };
}

export default getConfig;