# Package Dependencies Service for Snyk

## General notes
The application uses Redis for caching results, with a configurable TTL (default is one day). I considered using local memory cache, but decided to use Redis as it's easier to scale up a service this way. Also, I like Redis 🙂

I tried to build it so it can be easily extended with other package registries.

A request to the service should contain a package name, version (defaults to `latest`), and maximum depth of the tree (defaults to `1`).

## Usage
Install the dependencies using `npm i`.

There are two ways to start the service.
- Simply running the Node application. This requires Node 12.9 or higher to be installed, and will not use any caching for requests.
   ```bash
   $ npm start
   ```
- Using Docker Compose. This requires Docker and Docker Compose to be installed, and will run both the service and a Redis DB for caching, which improves response times substantially. 
  ```bash
  $ docker-compose up
  ```
Both method will result in a running server listening on port `3000` by default. Package dependencies can be retrieved either by:
- Directly querying the service
  ```bash
  $ curl localhost:3000/npm/<package_name>/<version (optional)>?depth=<depth (optional)>
  ```
- Using the provided CLI, to get the response in a nice tree view
  ```bash
  $ ./cli.js -p <package_name> -v <version> -d <depth>
  ```

## Test
Run `npm test` or `npm run cover` to get a coverage report.
