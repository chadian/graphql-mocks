import { PackOptions } from '../src/types';

export const generateEmptyPackOptions: () => PackOptions = () => ({
  state: {},
  dependencies: {},
});
