const semver = require('semver');
const config = require('config');
let redisClient;
if (config.cache.useCache) {
    redisClient = require('../cache/redis_client');
}
const axios = require('axios');
const axiosRetry = require('axios-retry');
axiosRetry(axios, {retries: config.requests.retries});
const defaultVersion = 'latest';
const registryURL = 'https://registry.npmjs.org';

/**
 * Request handler for the router
 * @param   {object}  req  a Fastify request object
 * @return  {object}       dependencies tree
 */
async function getPackageInfo(req) {
    const packageName = req.params.package;
    const version = req.params.version;
    const depth = req.query.depth;
    return getDependencies(packageName, version, depth);
}

/**
 * Get a list of all package dependencies recursively up to a given depth
 * @param   {string}  packageName  package to search
 * @param   {string}  version      specific package version
 * @param   {int}     depth        the depth of the dependencies tree. default is 1
 * @return  {object}               dependencies tree
 */
async function getDependencies(packageName, version, depth = 1) {
    const useCache = config.cache.useCache;
    version = parseVersion(version);
    const res = {name: packageName, version: version, dependencies: []};
    if (depth === 0) {
        return res;
    }
    let dependencies;
    let fromCache;
    if (useCache) {
        dependencies = await redisClient.getDependencies('npm', packageName, version);
        fromCache = true;
    }
    if (!dependencies) {
        fromCache = false;
        try {
            const deps = (await axios.get(`${registryURL}/${packageName}/${version}`)).data;
            dependencies = {...deps.dependencies, ...deps.devDependencies};
        } catch {
            //ignore failures
            return res;
        }
    }
    // save cache for later
    if (!fromCache && useCache) {
        redisClient.setDependencies('npm', packageName, version, dependencies);
    }

    // get sub-dependencies
    const subDeps = [];
    for (const key in dependencies) {
        subDeps.push(getDependencies(key, dependencies[key], depth - 1));
    }
    const subDepResults = await Promise.allSettled(subDeps);
    for (const subDep of subDepResults) {
        if (subDep.status === 'fulfilled') {
            res.dependencies.push(subDep.value);
        }
    }

    return res;
}

function parseVersion(versionStr) {
    // if no version was given, or version is 'latest', return latest
    if (!versionStr || versionStr === defaultVersion) {
        return defaultVersion;
    }
    let version;
    try {
        //force coercion of the version into semver format
        version = semver.minVersion(semver.valid(semver.coerce(versionStr))).version;
    } catch {
        version = defaultVersion;
    }
    return version;
}

module.exports = {getDependencies, getPackageInfo};