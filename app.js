const fastify = require('fastify')({logger: true});
const router = require('./router/router');
const npmHandler = require('./handler/npm_handler');
const npmRouter = new router(npmHandler);
const config = require('config');

fastify.register((...params) => npmRouter.route(...params), {prefix: '/npm'});

const start = async () => {
    try {
        await fastify.listen(config.server.port);
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();