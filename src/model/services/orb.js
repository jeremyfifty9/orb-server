/**
 * @overview Responsible for orb services
 */

let validator = require('validator'),
    exec = require('child_process').exec;

let Entity = require('../entities'),
    Recognition = require('./recognition'),
    OrbEmulator = require('./orbemulator'),
    LifxBulbAPI = require('./lifxbulbapi');

let Orb = {

    /**
     * Calculates relative usage by delegating the calculation to a shell script, which
     * outsources it.
     *
     * WARNING! This service passes raw parameter input to the shell. ONLY pass safe
     * filtered values to this function.
     *
     * @param  {Object}   params   Object with id, daysets, start, end parameters
     * @return {Promise}           Returns a promise with error or stdout
     */
    retrieveRelativeUsage: function (params) {
        let id = params.id, //meter ID
            daySets = params.daySets.slice(1, -1),
            sampleSize = params.sampleSize;

        //return Promise.resolve(Math.floor(Math.random()*101));

        return new Promise(function (resolve, reject) {
            exec(
                "php ../model/services/exe/relative-usage.php '" + id + "' '" + daySets + "' '" + sampleSize + "'",
                function (err, stdout, stderr) {
                    if (err) {
                        reject(err);
                    }

                    resolve(stdout);
                }
            );
        });


    },

    dispatchInstruction: function (instruction, bulb) {

        return new Entity.User({id: bulb.get('owner')}).fetch().then(function (owner) {
            return LifxBulbAPI.setBreathe({
                from_color: 'hue:' + instruction.hue + ' brightness:.6 saturation:1',
                color: 'hue:' + instruction.hue + ' brightness:.3 saturation:1',
                period: 1/instruction.frequency,
                cycles: 10*instruction.frequency
            }, 'id:' + bulb.get('selector'), owner.get('token')).then(function (mes){
                Promise.resolve();
            }).catch(console.log.bind(console));
        });

    },

    dispatchAll: function () {
        let me = this;

        Entity.Bulb.collection().query('where', 'enabled', '=', '1').fetch({withRelated: ['orb']})
        .then(function (bulbs) {
            bulbs.forEach(function (bulb){
                /**
                 * Calculate which meter to display. Every 20 seconds, this changes.
                 * Take the timestamp in ms and divide by 1000ms/1s, then divide by
                 * 20s. Floor this value (|0), mod 2 and add 1.
                 */
                let meter = ((+new Date()/20000|0) % 2)+1;

                OrbEmulator.emulate(bulb.relations.orb, meter).then(function (instruction) {
                    me.dispatchInstruction(instruction, bulb);
                });
            });
        })
    },

    retrieveList: function(sess) {
        let client = Recognition.knowsClient(sess);

        if (!client) {
            return Promise.reject({
                authError: true
            });
        }

        let orbList = [];

        /**
         * Query for a collection of all orbs related to authenticated client
         */
        return Entity.Orb.collection().query('where', 'owner', '=', client.id).orderBy('title').fetch({
            withRelated: ['meter1', 'meter2']
        }).then(function (results) {
            /**
             * Loop through each orb and store it in orbList
             */
            let meterPromises = [];

            results.forEach(function (orb) {
                let orbInfo = {id: orb.get('id'), title: orb.get('title')};

                meterPromises.push(orb.related('meter1').related('building').fetch().then(function (match) {
                    orbInfo.meter1 = {
                        building: match.get('name'),
                        name: orb.related('meter1').get('name')
                    };

                    return orb.related('meter2').related('building').fetch();
                }).then(function (match) {
                    orbInfo.meter2 = {
                        building: match.get('name'),
                        name: orb.related('meter2').get('name')
                    };

                    return true;
                }));

                orbList.push(orbInfo);
            });

            return Promise.all(meterPromises);
        }).then(function() {
            return Promise.resolve(orbList);
        });
    },

    retrieve: function(orbId, sess) {
        let client = Recognition.knowsClient(sess);

        if (!client) {
            return Promise.reject({
                authError: true
            });
        }

        return new Entity.Orb({
            id: orbId,
            owner: client.id
        }).fetch().then(function (orb) {
            if(!orb) {
                return Promise.reject('Records don\'t exist for the targetted orb');
            }

            return Promise.resolve(orb.attributes);
        });
    },
};

module.exports = Orb;
