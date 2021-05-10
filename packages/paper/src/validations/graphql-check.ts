import { GraphQLSchema, isObjectType } from 'graphql';
import { DataStore } from '../types';
import { graphqlTypeCheck } from './graphql-type-check';
import { graphqlConnectionsCheck } from './graphql-connections-check';
import { typeExists } from '../utils/graphql/type-exists';
import { TypeDoesNotExist } from './errors/type-does-not-exist';
import { TypeIsNotDocumentCompatible } from './errors/type-is-not-document-compatible';

export function graphqlCheck(data: DataStore, graphqlSchema: GraphQLSchema): void {
  for (const typename in data) {
    const documents = data[typename];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const type = graphqlSchema.getType(typename)!;

    if (!isObjectType(type)) {
      throw new TypeIsNotDocumentCompatible({ type });
    }

    if (!typeExists(graphqlSchema, typename)) {
      throw new TypeDoesNotExist({ typename });
    }

    documents.forEach((document) => {
      graphqlTypeCheck.validate({ data, graphqlSchema, document, type });
      graphqlConnectionsCheck({ graphqlSchema, document, typename, data });
    });
  }
}
