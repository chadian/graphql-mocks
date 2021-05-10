# TASKS

## TODO

- [ ] Allow `null` or a Null Document to be added for connections
- [ ] Create documents that do not correspond with an GraphQL type
- [ ] Capture events from transaction
- [ ] Factory helpers
- [ ] Visualize documents & keys and connections only

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
