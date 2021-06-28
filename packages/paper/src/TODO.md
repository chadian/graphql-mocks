# TASKS

## TODO

- [ ] Passthrough proxywrapped documents on mutation returns
- [ ] (create issue) Hooks - auto ID hook (if ID has not been set, create a hash or auto-increment)
- [ ] (create issue) validator `enable`/`disable` or `add`/`remove` options on `Paper`
- [ ] (create issue) Create documents that do not correspond with an GraphQL type (add tests demonstrating how this would work)
      - * Maybe a `skipMissingType` option on the validator interface and configuration
- [ ] (create issue) Factory helpers (add tests demonstrating how this would work)
- [ ] (create issue) Visualize documents & keys and connections only

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
- [X] Improve tests around `create` operation edge cases for nested documents
- [X] Add async queue for each transactions with FIFO
- [X] Create cloneDocument util and operation
- [X] Remove `put` operation
- [X] Remove `getDocumentsForType` and expose `store` directly
- [X] Prevent store from being pushed to directly via `data` property
- [X] Hooks - before/after transaction
- [X] Collapse validators on Paper to `validators.field` and `validators.document`
- [X] Hooks - add `queueEvent` to hooks and transactions

