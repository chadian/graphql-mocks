import { GraphQLList, GraphQLType, isListType, isNonNullType } from 'graphql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractListType(type: GraphQLType): GraphQLList<any> | undefined {
  if (isListType(type)) {
    console.log('returning type', type.toString());
    return type;
  }

  if (isNonNullType(type)) {
    return extractListType(type.ofType);
  }

  return undefined;
}
