/**
 * @overview Responsible for orb emulation service
 */

let validator = require('validator'),
    exec = require('child_process').exec;

let Entity = require('../entities'),
    Recognition = require('./Recognition');

let OrbEmulator = {

    /**
     * Emulates an inputted orb
     * @param {Promise} orb Resolves with an object with hue and frequeny.
     * @param {Integer} meter The meter that should be emulated
     */
    emulate: function(orb, meter, colorScheme) {
        if (isNaN(meter) || !(meter === 1 || meter === 2)) {
            return Promise.reject('Unknown meter');
        }

        /**
         * Holds arrays of orb percentile hues
         * @type {Array}
         */
        let colors = [
            /* Scheme 1 - Green/Red */
            [
              [[120, 1, 0.6], [120, 1, 0.3]], //Color 1 - lowest, green
              [[74, 1, 0.6], [74, 1, 0.35]], //Color 2
              [[62, 1, 0.6],[62, 1, 0.4]], //Color 3 - yellow
              [[37, 1, 0.6], [37, 1, 0.3]], //Color 4
              [[0, 1, 0.6], [0, 1, 0.4]] //Color 5 - highest - red
            ],

            /* Scheme 2 - White/Blue */
            [
              [[320, 0, 0.4], [320, 0, 0.25]], //Color 1 - white, lowest
              [[180, 0.55, 0.6], [180, 0.55, 0.45]], //Color 2
              [[188, 0.76, 0.5],[188, 0.76, 0.35]], //Color 3 -
              [[215, 0.9, 0.7], [215, 0.9, 0.55]], //Color 4
              [[255, 1, 0.27], [255, 1, 0.2]] //Color 5 
            ]
        ];

        return orb.related('relativeValue' + meter).fetch().then(function(relativeValue) {
            if (!(orb.get('colorScheme' + meter) in colors)) {
                return Promise.resolve({
                    pulseBetween: -1,
                    frequency: 0,
                    period: 0,
                    usage: -1
                });
            }

            let percentage = relativeValue.get('relative_value');

            let key = Math.round((percentage / 100) * 4),
                pulseBetween = -1;

            if(key in colors[orb.get('colorScheme' + meter)]) {
                pulseBetween = colors[orb.get('colorScheme' + meter)][key];
            }

            let frequency = ((percentage / 100) * 1.7) + .25; //times per second

            /**
             * Percentage of -1 indicates it hasn't been updated yet.
             */
            if (percentage < 0) {
                pulseBetween = -1;
                frequency = 0;
            }

            return Promise.resolve({
                pulseBetween: pulseBetween,
                frequency: frequency,
                period: frequency != 0 ? 1 / frequency : 0,
                usage: percentage
            });

        }).catch(console.log.bind(console));

    }
};

module.exports = OrbEmulator;
