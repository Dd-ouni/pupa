const {Server} = require('../build/src/server/index');

(async () => {
  const server = await Server.run(8000);
  server.setContent('/', '<h1>Hello world!</h2>');
})();
