// Type definitions for @faircamp-cms/config

export interface FaircampConfig {
  media_folder: string;
  public_folder: string;
  locale: string;
  backend: {
    name: string;
    repo: string;
    branch: string;
  };
  collections: any[];
}

export function getConfig(overrides?: Partial<FaircampConfig>): FaircampConfig;

declare const config: FaircampConfig;
export = config; 