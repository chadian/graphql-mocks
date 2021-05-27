# TASKS

## TODO

- [ ] set and get connected documents within mutations
- [ ] Passthrough proxywrapped documents on mutation returns
- [ ] Hooks
      - before/after transaction
      - create/update/delete
          - auto increment ID hook
- [ ] initialize store for known graphql types from schema
- [ ] validator `enable`/`disable` or `add`/`remove` options on `Paper`
      - [ ] Create documents that do not correspond with an GraphQL type (add tests demonstrating how this would work)
      - * Maybe a `skipMissingType` option on the validator interface and configuration
- [ ] Improve tests around `create` operation edge cases
- [ ] Factory helpers (add tests demonstrating how this would work)
- [ ] Visualize documents & keys and connections only
- [ ] Clean up the mutation and Paper get document interfaces
- [ ] Handle flagging deletions within a transaction instead of instant removal
- [ ] Create cloneDocument util and operation

## DONE

- [x] Look up by document key
- [x] Add a relationship operation (added `connect`)
- [x] Add relationship hydration on the gets
      This means being able to do store.data.Persons[0].friends
      where `friends` is a getter that can look at the meta and dynamically
      represent/lookup the corresponding object
- [X] Make API friendly for extracting ID if passed a document, ie connect(ID or document(id is internally stashed))
- [X] Make `mutate` async
- [X] Involve the GraphQL Schema for transaction checks
- [X] Make reads to the store sync
- [X] Allow `null` or a Null Document to be added for connections
- [X] Capture events from transaction
- [X] unique ID field validator
- [X] Passthrough return from transaction to mutate
- [X] Add __typename getter to documents
