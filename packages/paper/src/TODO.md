# TASKS

## TODO
- [ ] Improve tests around `create` operation edge cases for nested documents
- [ ] Passthrough proxywrapped documents on mutation returns
- [ ] Add async queue for each transactions with FIFO
- [ ] Hooks - before/after transaction
- [ ] Hooks - create/update/delete document operations
- [ ] validator `enable`/`disable` or `add`/`remove` options on `Paper`
      - [ ] Create documents that do not correspond with an GraphQL type (add tests demonstrating how this would work)
      - * Maybe a `skipMissingType` option on the validator interface and configuration
- [ ] Factory helpers (add tests demonstrating how this would work)
- [ ] Visualize documents & keys and connections only
- [ ] Create cloneDocument util and operation
- [ ] `connect` (and maybe `disconnect`) event
- [ ] Hooks - auto ID hook (if ID has not been set, create a hash)

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
- [X] set and get connected documents within mutations
- [X] Create consolidated interface `find` and `findDocument` on paper instance and within `mutate`
- [X] Improve tests around connection proxy
- [X] initialize store for known graphql types from schema
- [X] Add tests around collapsing connections
