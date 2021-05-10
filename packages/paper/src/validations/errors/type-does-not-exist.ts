export class TypeDoesNotExist extends Error {
  constructor({ typename }: { typename: string }) {
    super();

    this.name = 'TypeDoesNotExist';
    this.message = `The type "${typename}" does not exist in the the graphql schema.`;
  }
}
