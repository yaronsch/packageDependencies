const redis = require('redis');
const config = require('config');
const client = redis.createClient({host: config.cache.redisHost, port: config.cache.redisPort});
const {promisify} = require('util');
const rangeAsync = promisify(client.lrange).bind(client);
const EMPTY = 'EMPTY';

/**
 * Get package dependencies from cache
 * @param   {string}  repo         repository name
 * @param   {string}  packageName  package name
 * @param   {string}  version      package version
 * @return  {array}                list of dependencies
 */
async function getDependencies(repo, packageName, version) {
    const cacheKey = `{${repo}_}${packageName}@${version}`;
    const dependencies = await rangeAsync(cacheKey, 0, -1);
    if (!dependencies || dependencies.length === 0) {
        return null;
    }
    if (dependencies.length === 1 && dependencies[0] === EMPTY) {
        return {};
    }
    const res = {};
    for (const dep of dependencies) {
        const [name, version] = dep.split('@');
        res[name] = version;
    }
    return res;
}

/**
 * Save package dependencies into cache
 *
 * @param   {string}  repo         repository name
 * @param   {string}  packageName  package name
 * @param   {string}  version      package version
 * @param   {object}  dependencies list of package dependencies
 */
function setDependencies(repo, packageName, version, dependencies) {
    if (!dependencies) {
        return;
    }
    const depStrings = [];
    for (const key in dependencies) {
        depStrings.push(`${key}@${dependencies[key]}`);
    }
    if (depStrings.length === 0) {
        depStrings.push(EMPTY);
    }
    const cacheKey = `{${repo}_}${packageName}@${version}`;
    client.batch()
        .rpush(cacheKey, ...depStrings)
        .expire(cacheKey, config.cache.ttl)
        .exec();
}

module.exports = {getDependencies, setDependencies};