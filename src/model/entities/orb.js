/**
 * @overview Orb entitiy
 */

let User = require('./User'),
    RelativeValue = require('./RelativeValue'),
    Bulb = require('./Bulb');


var Orb = {
    tableName: 'orb-server_orbs',

    owner: function() {
        return this.belongsTo('User', 'owner');
    },

    bulbs: function() {
        return this.hasMany('Bulb', 'orb');
    },

    relativeValue1: function() {
        return this.belongsTo('RelativeValue', 'relativeValue1Id');
    },

    relativeValue2: function() {
        return this.belongsTo('RelativeValue', 'relativeValue2Id');
    },

    validate: function() {
        let title = this.get('title');

        let errors = {};

        if (title.length > 150) {
            errors.title = ['Title too long. 150 characters maximum.'];
        }

        if (Object.keys(errors).length !== 0) {
            return Promise.resolve(errors);
        } else {
            return Promise.resolve();
        }
    }
};

module.exports = Orb;
