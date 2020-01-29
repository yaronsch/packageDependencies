const {assert} = require('chai');
const nock = require('nock');
const npmHandler = require('../handler/npm_handler');

describe('npm handler', () => {
    beforeEach(() => {
        nock('https://registry.npmjs.org').get('/test/1.2.3').reply(200, {
            dependencies: {d1: '^2.4.5', d2: '~4.3.0'},
            devDependencies: {d3: '23.3.4', d4: '3.4.5'}
        });
        nock('https://registry.npmjs.org').get('/test/latest').reply(200, {
            dependencies: {d1: '^2.4.5', d2: '~4.3.0'},
            devDependencies: {d3: '23.3.4', d4: '3.4.5'}
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('should return all dependencies', async () => {
        const deps = await npmHandler.getDependencies('test', '1.2.3');
        assert.equal(deps.name, 'test');
        assert.equal(deps.version, '1.2.3');
        assert.equal(deps.dependencies.length, 4);
    });

    it('should get latest version if no version provided', async () => {
        const deps = await npmHandler.getDependencies('test');
        assert.equal(deps.name, 'test');
        assert.equal(deps.version, 'latest');
        assert.equal(deps.dependencies.length, 4);
    });

    it('should go deep', async () => {
        nock('https://registry.npmjs.org').get('/d4/3.4.5').reply(200, {
            dependencies: {d5: '2.3.4', d6: '5.3.3'}
        });
        const deps = await npmHandler.getDependencies('test', '^1.2.3', 2);
        assert.equal(deps.name, 'test');
        assert.equal(deps.version, '1.2.3');
        assert.equal(deps.dependencies.length, 4);
        assert.equal(deps.dependencies[3].dependencies.length, 2);
    });

    it('should not go deep', async () => {
        nock('https://registry.npmjs.org').get('/d4/3.4.5').reply(200, {
            dependencies: {d5: '2.3.4', d6: '5.3.3'}
        });
        const deps = await npmHandler.getDependencies('test', '^1.2.3', 1);
        assert.equal(deps.name, 'test');
        assert.equal(deps.version, '1.2.3');
        assert.equal(deps.dependencies.length, 4);
        assert.equal(deps.dependencies[3].dependencies.length, 0);
    });
});