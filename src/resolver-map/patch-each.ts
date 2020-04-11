import { GraphQLSchema, GraphQLObjectType, GraphQLField } from 'graphql';
import { Resolver, ResolverMap, ResolverMapWrapper } from '../types';
import { embedPackOptions } from './pack-wrapper';

export type PatchOptions = {
  patchWith: (context: {
    resolvers: ResolverMap;
    type: GraphQLObjectType;
    field: GraphQLField<any, any, any>;
  }) => Resolver | undefined;
};

export const patchEach = (schema: GraphQLSchema, options: PatchOptions): ResolverMapWrapper => (
  resolvers: ResolverMap,
  packOptions,
) => {
  const typeMap = schema.getTypeMap();

  for (const typeKey of Object.keys(typeMap)) {
    const type = typeMap[typeKey];
    const isObjectType = type instanceof GraphQLObjectType;

    if (isObjectType) {
      const fields = (type as GraphQLObjectType).getFields();

      for (const fieldKey of Object.keys(fields)) {
        const field = fields[fieldKey];

        if (!resolvers[typeKey] || (resolvers[typeKey] && !resolvers[typeKey][fieldKey])) {
          const patchResolver = options.patchWith({ resolvers, type: type as GraphQLObjectType, field });

          if (typeof patchResolver === 'function') {
            resolvers[typeKey] = resolvers[typeKey] || {};
            resolvers[typeKey][fieldKey] = embedPackOptions(patchResolver, packOptions);
          }
        }
      }
    }
  }

  return resolvers;
};