const router = require('./router/router');
const npmHandler = require('./handler/npm_handler');
const npmRouter = new router(npmHandler);
const config = require('config');
const express = require('express');
const app = express();

app.use('/npm', npmRouter.router);
app.listen(config.server.port, () => {
    console.log(`server is listening on port ${config.server.port}`);
});
