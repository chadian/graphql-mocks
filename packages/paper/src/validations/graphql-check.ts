import { GraphQLSchema } from 'graphql';
import { DataStore } from '../types';
import { graphqlTypeCheck } from './graphql-type-check';
import { graphqlConnectionsCheck } from './graphql-connections-check';

export function graphqlCheck(data: DataStore, graphqlSchema: GraphQLSchema): void {
  for (const typename in data) {
    const documents = data[typename];
    documents.forEach((document) => {
      graphqlTypeCheck({ graphqlSchema, document, typename });
      graphqlConnectionsCheck({ graphqlSchema, document, typename, data });
    });
  }
}
