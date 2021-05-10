import { GraphQLField, isListType, isNonNullType } from 'graphql';

export class FieldReturnTypeMismatch extends Error {
  constructor({
    field,
    actual,
    expected,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: GraphQLField<any, any>;
    actual: string;
    expected: string;
  }) {
    super();
    this.name = 'FieldReturnTypeMismatch';
    const type = field.type;

    let typeDisplayName;
    if (isListType(type)) {
      typeDisplayName = `[${type.ofType}]`;
    } else if (isNonNullType(type)) {
      typeDisplayName = `${type.ofType}! (non-null)`;
    } else {
      typeDisplayName = type.name;
    }

    this.message = `The field "${field.name}" represents a graphql "${typeDisplayName}" type and on the document should be a ${expected}, but got ${actual}`;
  }
}
