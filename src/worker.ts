import type { CloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateCloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PostsAPI } from './posts-api';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  PRECOMPUTED_NONCE: string;
}
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }
  
  type Post {
    id: Int
    title: String
    body: String
    userId: Int
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    posts: [Post]
  }
`;
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];
const resolvers = {
  Query: {
    books: () => books,
    posts: async (_: any, __: any, { dataSources }: ContextValue) => {
      return dataSources.postsAPI.getPosts();
    },
  },
};
interface ContextValue {
  dataSources: {
    postsAPI: PostsAPI;
  };
}
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const server = new ApolloServer<ContextValue>({
      typeDefs,
      resolvers,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ footer: false, precomputedNonce: env.PRECOMPUTED_NONCE })],
    });

    const handleGraphQLRequest: CloudflareWorkersHandler = startServerAndCreateCloudflareWorkersHandler(server, {
      context: async ({ request }) => {
        const { cache } = server;
        return {
          dataSources: {
            postsAPI: new PostsAPI({ cache, fetch: fetch.bind(globalThis) }),
          },
        };
      },
    });
    console.log('env', env);
    return handleGraphQLRequest(request);
  },
};

// addEventListener('fetch', (e) => e.respondWith(handleGraphQLRequest(e.request as Request)));
