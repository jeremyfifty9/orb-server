/**
 * @overview Handles all entities
 */


/**
 * Dependencies
 */
let Bookshelf = require('../components/bookshelf');

/**
 * Names of entities in current directory
 * @name entities
 * @type {Array}
 */
let entities = [
    'API',
    'CoreUser',
    'User',
    'Orb',
    'Meter',
    'Building',
    'Bulb',
    'RelativeValue',
    'Integration'
];

/**
 * Include controllers
 */

entities.forEach(function(name) {
    module.exports[name] = Bookshelf.Model.extend(require('./' + name));
    Bookshelf.model(name, module.exports[name]);
});
