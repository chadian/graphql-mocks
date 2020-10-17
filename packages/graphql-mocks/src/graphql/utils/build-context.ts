import { GraphQLArgs } from 'graphql';
import { PackOptions } from '../../pack/types';
import { ResolverContext } from '../../types';

export function buildContext({
  initialContext,
  queryContext,
  packOptions,
}: {
  initialContext?: GraphQLArgs['contextValue'];
  queryContext?: GraphQLArgs['contextValue'];
  packOptions: PackOptions;
}): ResolverContext {
  return {
    ...initialContext,
    ...queryContext,
    pack: packOptions,
  };
}
