async function getPackageInfo(req, reply) {
    reply.send(req.params);
}

module.exports = {getPackageInfo};