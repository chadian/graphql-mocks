import { buildConfig } from '../../build-utils/rollup';
import pkg from './package.json';
export default buildConfig(pkg, ['cjs', 'es'], { external: [/^graphql-mocks\/.*/] });
