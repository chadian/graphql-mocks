import { GraphQLField, GraphQLObjectType } from 'graphql';
import { unwrap } from '../../graphql/unwrap';

export class FieldCannotConnectMultiple extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ type, field }: { type: GraphQLObjectType; field: GraphQLField<any, any> }) {
    super();

    this.name = 'FieldCannotConnectMultiple';
    this.message = `Multiple connections can only exist for fields with a list return type. Field ${field.name} on ${
      type.name
    } has a singular return type of ${unwrap(field.type).name}`;
  }
}
