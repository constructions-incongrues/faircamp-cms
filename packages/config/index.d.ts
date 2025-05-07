// Type definitions for @faircamp-cms/config

export interface FaircampConfig {
  mediaFolder: string;
  publicFolder: string;
  locale: string;
}

declare const config: FaircampConfig;
export = config; 