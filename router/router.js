const express = require('express');
const expressRouter = express.Router();
class PackageRouter {
    constructor(handler) {
        this.handler = handler;
    }

    get router() {
        expressRouter.get('/:package/:version', this.handler.getPackageInfo);
        expressRouter.get('/:package', this.handler.getPackageInfo);
        return expressRouter;
    }
}

module.exports = PackageRouter;
