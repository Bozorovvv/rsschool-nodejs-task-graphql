import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLSchema, validate, parse, graphql } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { RootQuery } from './schema/resolvers/queries.js';
import { Mutations } from './schema/resolvers/mutations.js';
import { createLoaders } from './loaders/loaders.js';

interface GQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutations,
  });

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req: { body: GQLRequest }) {
      const loaders = createLoaders(prisma);
      const documentAST = parse(req.body.query);
      const validationErrors = validate(schema, documentAST, [depthLimit(5)]);

      if (validationErrors.length > 0) {
        return { errors: validationErrors };
      }

      const result = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { prisma, loaders },
      });

      return result;
    },
  });
};

export default plugin;
