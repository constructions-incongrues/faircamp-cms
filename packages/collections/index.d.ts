import { DeepPartial } from 'ts-essentials';

export interface CollectionField {
  label: string;
  name: string;
  widget: string;
  [key: string]: any;
}

export interface CollectionSchema {
  name: string;
  label: string;
  folder?: string;
  create?: boolean;
  path?: string;
  format?: string;
  fields: CollectionField[];
  [key: string]: any;
}

export type CollectionOverride = DeepPartial<CollectionSchema>;

export function Catalog(overrides?: CollectionOverride): CollectionSchema;
export function Artist(overrides?: CollectionOverride): CollectionSchema;
export function Release(overrides?: CollectionOverride): CollectionSchema;
export function Track(overrides?: CollectionOverride): CollectionSchema; 