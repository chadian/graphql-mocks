import { GraphQLObjectType, GraphQLSchema, GraphQLType, isAbstractType, isObjectType } from 'graphql';
import { unwrap } from './unwrap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractObjectTypes(schema: GraphQLSchema, type: GraphQLType): GraphQLObjectType<any>[] {
  const unwrapped = unwrap(type);

  if (isObjectType(unwrapped)) {
    return [unwrapped];
  }

  if (isAbstractType(unwrapped)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return schema.getPossibleTypes(unwrapped) as GraphQLObjectType<any>[];
  }

  return [];
}
