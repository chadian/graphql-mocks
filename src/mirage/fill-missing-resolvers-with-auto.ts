import {GraphQLObjectType} from 'graphql';
import mirageFieldResolver from './auto-field-resolver';

// iterate over all types and fields as given by the schema
// then if any resolvers are missing, patch them with an
// auto mirage field resolver.
export default (mirageServer: any, mirageGraphQLMap: any, schema: any) => (resolvers: any) => {
  const typeMap = schema.getTypeMap();

  for (const type of Object.keys(typeMap)) {
    if (typeMap[type] instanceof GraphQLObjectType) {
      const fields = (typeMap[type] as GraphQLObjectType).getFields();

      for (const field of Object.keys(fields)) {
        resolvers[type] = resolvers[type] || {};
        if (type === 'Query' || type === 'Mutation' || type.indexOf('__') === 0) {
          continue;
        }

        if (!resolvers[type][field]) {
          const match = mirageGraphQLMap.find(
            (mapDefinition: any) => mapDefinition.graphql[0] === type && mapDefinition.graphql[1] === field
          );

          const mirageType = match ? match.mirage[0] : type;
          const mirageField = match ?  match.mirage[1] : field;
          resolvers[type][field] = mirageFieldResolver(mirageServer, mirageType, mirageField);
        }
      }
    }
  }

  return resolvers;
}