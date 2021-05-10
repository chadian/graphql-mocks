# TASKS

## TODO

- [ ] Create documents that do not correspond with an GraphQL type
- [ ] Capture events from transaction

- [ ] Make API friendly for extracting ID if passed a document, ie connect(ID or document(id is internally stashed)) \* Might be able to check produced patches as they should have the CRUDy operations
- [ ] Involve the GraphQL Schema for transaction checks
- [ ] Visualize
      documents & keys and connections only
- [ ] Factory helpers
- [ ] Make `mutate` async
  - [ ] Make reads to the store sync
  - [ ] Maybe add a `static` or a `readOnly` container that is like
        a mutation frame but with read-only operations
- [ ] How to handle unions/interfaces?

## DONE

- [x] Look up by document key
- [x] Add a relationship operation (added `connect`)
- [x] Add relationship hydration on the gets
      This means being able to do store.data.Persons[0].friends
      where `friends` is a getter that can look at the meta and dynamically
      represent/lookup the corresponding object
