import { RESTDataSource } from '@apollo/datasource-rest';
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { Fetcher } from '@apollo/utils.fetcher';

export class UrlEncodedAPI extends RESTDataSource {
  constructor(options: { cache: KeyValueCache; fetch?: Fetcher }) {
    super(options);
    this.baseURL = 'http://localhost:3000';
  }

  async testAPI() {
    const urlencoded = new URLSearchParams({
      name: 'John Doe',
    });
    return this.post('/api/data', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlencoded.toString(),
    });
  }
}
