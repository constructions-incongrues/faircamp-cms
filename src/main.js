
import { init } from '@sveltia/cms';
import { getConfig } from '@faircamp-cms/config';

init({
  config: getConfig(),
  target: '#app'
}); 