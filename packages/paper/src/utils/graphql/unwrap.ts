import {
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLType,
} from 'graphql';

type UnwrappedType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLInputObjectType;

export function unwrap(type: GraphQLType): UnwrappedType {
  return 'ofType' in type ? unwrap(type.ofType) : type;
}
