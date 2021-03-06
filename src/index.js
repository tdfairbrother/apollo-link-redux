import { ApolloLink } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

export const APOLLO_QUERY_INIT = 'APOLLO_QUERY_INIT';
export const APOLLO_QUERY_RESULT = 'APOLLO_QUERY_RESULT';
export const APOLLO_MUTATION_INIT = 'APOLLO_MUTATION_INIT';
export const APOLLO_MUTATION_RESULT = 'APOLLO_MUTATION_RESULT';
export const APOLLO_SUBSCRIPTION_INIT = 'APOLLO_SUBSCRIPTION_INIT';
export const APOLLO_SUBSCRIPTION_RESULT = 'APOLLO_SUBSCRIPTION_RESULT';

const payload = ({
  operationName,
  variables,
  query
}) => ({
  operationName,
  variables,
  document: query
});

export const queryInit = operation => {
  return ({
    type: APOLLO_QUERY_INIT,
    ...payload(operation)
  });
};

export const queryResult = (result, operation) => ({
  type: APOLLO_QUERY_RESULT,
  result,
  ...payload(operation)
});

export const mutationInit = operation => ({
  type: APOLLO_MUTATION_INIT,
  ...payload(operation)
});

export const mutationResult = (result, operation) => ({
  type: APOLLO_MUTATION_RESULT,
  result,
  ...payload(operation)
});

export const subscriptionInit = operation => ({
  type: APOLLO_SUBSCRIPTION_INIT,
  ...payload(operation)
});

export const subscriptionResult = (result, operation) => ({
  type: APOLLO_SUBSCRIPTION_RESULT,
  result,
  ...payload(operation)
});

const isQuery = op => op === 'query';
const isMutation = op => op === 'mutation';
const isSubscription = op => op === 'subscription';

class ReduxLink extends ApolloLink {
  /**
   * @param store - redux store
   */
  constructor(store) {
    super();
    this.store = store;
  }
  request(operation, forward) {
    const observer = forward(operation);
    let definition = getMainDefinition(operation.query);
    if (isQuery(definition.operation)) {
      this.store.dispatch(queryInit(operation));
    }
    else if (isMutation(definition.operation)) {
      this.store.dispatch(mutationInit(operation));
    }
    else if (isSubscription(definition.operation)) {
      this.store.dispatch(subscriptionInit(operation));
    }
    return observer.map(result => {
      if (isQuery(definition.operation)) {
        this.store.dispatch(queryResult(result, operation));
      }
      else if (isMutation(definition.operation)) {
        this.store.dispatch(mutationResult(result, operation));
      }
      else if (isSubscription(definition.operation)) {
        this.store.dispatch(subscriptionResult(result, operation));
      }
      return result;
    });
  }
}

export default ReduxLink;
