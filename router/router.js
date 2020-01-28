class PackageRouter {
    constructor(handler) {
        this.handler = handler;
    }

    route(fastify, opts, done) {
        fastify.get('/:package/:version', this.handler.getPackageInfo);
        fastify.get('/:package', this.handler.getPackageInfo);
        done();
    }
}

module.exports = PackageRouter;
