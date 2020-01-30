#!/usr/bin/env node
const program = require('commander');
const config = require('config');
const axios = require('axios');
const treeify = require('treeify');

const serverURL = `http://${config.server.host}:${config.server.port}/npm`;

(async () => {
    program
        .requiredOption('-p, --package <string>', 'package name')
        .option('-v, --version <string>', 'package version', 'latest')
        .option('-d, --depth <number>', 'depth of dependencies tree', parseDepth);

    program.parse(process.argv);
    const packageName = program.package;
    const version = program.version;
    const depth = program.depth;

    const dependencies = (await axios.get(`${serverURL}/${packageName}/${version}?depth=${depth}`)).data;
    console.log(treeify.asTree(dependencies, true));

})();

function parseDepth(d) {
    let depth;
    try {
        depth = parseInt(d);
    } catch {
        depth = 1;
    }
    return depth;
}