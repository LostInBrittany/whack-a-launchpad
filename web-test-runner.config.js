import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: 'spec/**/*.test.js',
  nodeResolve: true,
  browsers: [ playwrightLauncher( { product: 'chromium' } ) ],
};
