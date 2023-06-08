import type { CloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateCloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PostsAPI } from './posts-api';
import { UrlEncodedAPI } from './urlencoded-api';

export interface Env {}
const typeDefs = `#graphql
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
  
  type UrlEncodedAPIResponse {
    message: String
  }

  type Query {
    books: [Book]
    posts: [Post]
    urlEncodedAPI: UrlEncodedAPIResponse
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
    urlEncodedAPI: async (_: any, __: any, { dataSources }: ContextValue) => {
      return dataSources.urlEncodedAPI.testAPI();
    },
  },
};
interface ContextValue {
  dataSources: {
    postsAPI: PostsAPI;
    urlEncodedAPI: UrlEncodedAPI;
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
        urlEncodedAPI: new UrlEncodedAPI({ cache, fetch: fetch.bind(globalThis) }),
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
