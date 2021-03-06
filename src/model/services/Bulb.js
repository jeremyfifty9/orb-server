/**
 * @overview Responsible for bulb services
 */

let Bookshelf = require('../components/bookshelf'),
    util = require('util');

let Entity = require('../entities'),
    Recognition = require('./Recognition');

let Bulb = {
    /**
     * Takes parameters and attempts to configure a bulb
     * @param  {Object} params Configuration parameters
     * @return {Promise} Resolves on success, rejects on errors.
     */
    save: function(params, sess) {
        let client = Recognition.knowsClient(sess);

        if (!client) {
            return Promise.reject({
                authError: true
            });
        }

        let errors = {};

        let selector = params.selector,
            integration = params.integration,
            enabled = params.enabled,
            pulse_intensity = params.pulse_intensity,
            brightness = params.brightness;

        /**
         * Filter the orb input so that empty is null
         * @type {Integer}
         */
        let orb = params.orb === "" ? null : params.orb;

        let bulbParams = {
            owner: client.id,
            selector: selector,
            enabled: enabled === "true", //convert string to Boolean
            orb: orb,
            pulse_intensity: pulse_intensity,
            brightness: brightness,
            integration: integration,
            status: null
        };

        let bulb = new Entity.Bulb(bulbParams);

        return bulb.validate().then(function(validationErrs) {
            if (validationErrs) {
                Object.assign(errors, validationErrs); //Merge errors
            }

            /**
             * If the orb is null, there's no reason to ensure the orb exist
             */
            if (orb == null) {
                return Promise.resolve();
            }

            /**
             * Fetch the inputted orb to validate existence and ownership
             * @type {[type]}
             */
            return new Entity.Orb({
                id: orb
            }).fetch();
        }).then(function(match) {
            if ((match && match.get('owner') === client.id) ||
                orb == null) {

                /**
                 * NOTICE: data mapper logic leaking to service layer because Knex
                 * and Bookshelf do not support upserts
                 */
                let query = util.format(`\
                    INSERT INTO \`%s\` (owner, enabled, orb, selector, integration, pulse_intensity, brightness)
                        VALUES (:owner, :enabled, :orb, :selector, :integration, :pulse_intensity, :brightness)
                    ON DUPLICATE KEY UPDATE
                        enabled = :enabled,
                        orb = :orb,
                        owner = :owner,
                        integration = :integration,
                        pulse_intensity = :pulse_intensity,
                        brightness = :brightness
                `, bulb.tableName);

                return Bookshelf.knex.raw(query, bulbParams);

            }

            return Promise.resolve();
        })

    },

    retrieve: function(bulbSelector, sess) {
        let client = Recognition.knowsClient(sess);

        if (!client) {
            return Promise.reject({
                authError: true
            });
        }

        /**
         * Fetches the specified bulb limited to the session-authenticated user
         */
        return new Entity.Bulb({
            selector: bulbSelector,
            owner: client.id
        }).fetch().then(function(bulb) {
            if (!bulb) {
                return Promise.reject({
                    noRecord: true
                });
            }

            return Promise.resolve(bulb);
        });
    }
};

module.exports = Bulb;
