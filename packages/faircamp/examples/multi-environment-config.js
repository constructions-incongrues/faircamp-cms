/**
 * Example showing how to use multiple configurations with Faircamp
 *
 * This example demonstrates setting up different configurations for:
 * 1. Development environment with local backend
 * 2. Staging environment with GitHub backend
 * 3. Production environment with production settings
 */

import {
    registerConfig,
    getConfig,
    setActiveConfig,
    getActiveConfigName
  } from 'faircamp/config';

  // Register development configuration
  registerConfig('development', {
    // Use local backend for development
    backend: {
      name: 'local',
      url: 'http://localhost:8081/api'
    },
    // Development-specific paths
    media_folder: 'dev/media',
    public_folder: '/dev/media',
    // Show 'DEV' in the admin UI
    display_url: 'http://localhost:8080',
    site_title: 'Faircamp CMS (Development)',
    // Enable debugging features
    local_backend: true,
    load_config_file: true
  });

  // Register staging configuration
  registerConfig('staging', {
    backend: {
      name: 'github',
      repo: 'myorg/my-faircamp-site',
      branch: 'staging',
      publish_mode: 'editorial_workflow',
    },
    media_folder: 'static/media/uploads',
    public_folder: '/media/uploads',
    display_url: 'https://staging.example.com',
    site_title: 'Faircamp CMS (Staging)'
  });

  // Register production configuration
  registerConfig('production', {
    backend: {
      name: 'github',
      repo: 'myorg/my-faircamp-site',
      branch: 'main',
      auth_scope: 'public_repo', // Minimal permissions
    },
    media_folder: 'static/media/uploads',
    public_folder: '/media/uploads',
    display_url: 'https://example.com',
    site_title: 'Faircamp CMS',
    // Production-specific settings
    publish_mode: 'simple',
    logo_url: 'https://example.com/logo.svg',
    site_domain: 'example.com',
    // Add production-specific collections
    collections: [
      // ... production collections
    ]
  });

  // Choose the active configuration based on the environment
  const env = process.env.NODE_ENV || 'development';
  setActiveConfig(env);
  console.log(`Active configuration: ${getActiveConfigName()}`);

  // Get the active configuration
  const config = getConfig();
  console.log('Using configuration:', config.site_title);

  // Export the configuration for use with your CMS
  export default config;