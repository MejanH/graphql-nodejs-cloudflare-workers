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
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
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
const server = new ApolloServer<ContextValue>({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ footer: false })],
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
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleGraphQLRequest(request);
  },
};

// addEventListener('fetch', (e) => e.respondWith(handleGraphQLRequest(e.request as Request)));
