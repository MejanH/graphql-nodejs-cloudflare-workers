import { RESTDataSource } from '@apollo/datasource-rest';
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { Fetcher } from '@apollo/utils.fetcher';

export class PostsAPI extends RESTDataSource {
  constructor(options: { cache: KeyValueCache; fetch?: Fetcher }) {
    super(options);
    this.baseURL = 'https://jsonplaceholder.typicode.com';
  }

  async getPosts() {
    return this.get('/posts', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
