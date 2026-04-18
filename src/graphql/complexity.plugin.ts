import { Plugin } from '@nestjs/apollo';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError, Kind } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const maxComplexity = 120;
    const { schema } = this.gqlSchemaHost;

    return Promise.resolve({
      didResolveOperation({ request, document }) {
        const isIntrospectionQuery = document.definitions.some((def) => {
          if (def.kind !== Kind.OPERATION_DEFINITION) return false;
          return def.selectionSet.selections.every(
            (sel) =>
              sel.kind === Kind.FIELD &&
              (sel.name.value === '__schema' || sel.name.value === '__type'),
          );
        });

        if (isIntrospectionQuery) {
          return;
        }

        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}.`,
          );
        }

        return Promise.resolve();
      },
    });
  }
}
