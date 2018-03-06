const Validator = require('jsonschema').Validator;
const v = new Validator();

const createPromiseRequestSchema = {
    "type": "object",
    "properties": {
        "server_id": {
            "type": "string",
            "required": true
        },
        "trustkey_ts": {
            "type": "integer",
            "required": true
        },
        "n_bytes": {
            "type": "integer",
            "required": true
        },
    }
};

const resolvePromiseRequestSchema = {
    "type": "object",
    "properties": {
        "server_id": {
            "type": "string",
            "required": true
        },
        "trustkey_ts": {
            "type": "integer",
            "required": true
        },
        "server_round_time": {
            "type": "integer",
            "required": true
        }
    }
};

const errorCodes = require('./errorCodes');

class TrustkeyFirstPerfectPromiseService {
    constructor(imports) {
        this.core = imports.core;
        this.rng = imports.rng;
        this.name = "trustkey_first_perfect";
    }

    createPromise(request, callback) {
        //Recheck promise params and generate seed

        const vRes = v.validate(request, createPromiseRequestSchema);

        let response = {};

        const respondWithError = (ec) => {
            response.success = false;
            response.error_code = ec;
            response.error = errorCodes[ec];

            callback(response);
        };

        if (vRes.errors.length) {
            response.validation_errors = vRes.errors;
            return respondWithError(1);
        }

        let supervisor = this.core.getSupervisorByServerId(request.server_id);

        if (!supervisor.success || !supervisor.result.connected)
            return respondWithError(2);

        supervisor = supervisor.result;

        if ((request.trustkey_ts % supervisor.roundTime) !== 0)
            return respondWithError(3);

        request.server_round_time = supervisor.roundTime;
        request.seed = this.rng.generate(request.n_bytes);

        delete request.n_bytes;

        response.success = true;
        response.result = request;

        callback(response);
    }

    resolvePromise(request, callback) {
        const vRes = v.validate(request, resolvePromiseRequestSchema);

        let response = {};

        const respondWithError = (ec) => {
            response.success = false;
            response.error_code = ec;
            response.error = errorCodes[ec];

            callback(response);
        };

        if (vRes.errors.length) {
            response.validation_errors = vRes.errors;
            return respondWithError(1);
        }

        let seedBytes = request.seed;

        if (typeof (seedBytes) === 'string')
            seedBytes = Buffer.from(seedBytes, 'base64');

        if (!Buffer.isBuffer(seedBytes))
            return respondWithError(7);

        let supervisor = this.core.getSupervisorByServerId(request.server_id);

        if (!supervisor.success)
            return respondWithError(2);

        supervisor = supervisor.result;

        supervisor.trustkeysCollection.findOne({
            ts: {"$gte": request.trustkey_ts},
            n_unresolved_hashes: 0
        }, (err, targetTrustkey) => {
            if (err) {
                response.db_error = err;
                return respondWithError(4);
            }

            if (!targetTrustkey) {
                return respondWithError(6);
            }

            if (!targetTrustkey.is_trusted) {
                response.trustkey = targetTrustkey;
                return respondWithError(5);
            }
            const targetTkTs = targetTrustkey.ts;

            const calculateAndRespond = () => {
                const trustkeyDigest = Buffer.from(targetTrustkey.trustkey, 'hex');

                const length = trustkeyDigest.length;

                for (let i = 0; i < seedBytes.length; ++i) {
                    seedBytes[i] = seedBytes[i] ^ trustkeyDigest[i % trustkeyDigest.length];
                }

                callback({
                    success: true,
                    result: seedBytes,
                    info: {
                        trustkey_ts: targetTkTs
                    }
                });
            };

            if (targetTkTs === request.trustkey_ts) //Just respond if target trustkey was perfect
                return calculateAndRespond();

            // Check if every trustkey in period between request.trustkey_ts
            // and targetTrustkey.ts was supervised and trusted

            supervisor.trustkeysCollection.find({
                ts: {"$gte": request.trustkey_ts, "$lt": targetTkTs},
                is_trusted: true
            }).toArray((err, rows) => {
                if(err)
                    return respondWithError(4);

                let expectedTs = request.trustkey_ts;

                let i = 0;

                while (expectedTs < targetTkTs) {
                    let currTk = rows[i];

                    if(!currTk ||
                        !currTk.is_trusted ||
                        currTk.ts !== expectedTs) {
                        return respondWithError(7);
                    }

                    expectedTs += request.server_round_time;
                    ++i;
                }

                calculateAndRespond();
            });
        });

    }
}

module.exports = function setup(options, imports, register) {
    const alg = new TrustkeyFirstPerfectPromiseService(imports);

    imports.promise.postAlgorithm(alg);
    register(null, {
        trustkey_first_perfect: alg
    });
};