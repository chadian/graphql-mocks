import { GraphQLSchema } from 'graphql';

export function typeExists(graphqlSchema: GraphQLSchema, typename: string): boolean {
  return Boolean(graphqlSchema.getType(typename));
}
