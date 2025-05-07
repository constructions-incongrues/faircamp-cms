import { init } from '@sveltia/cms';
import { getConfig } from '@constructions-incongrues/faircamp-cms-config';

init({
  config: getConfig(),
  target: '#app'
}); 
