let orbView = {
    configure: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser(),
            form = appmodel.getInputs(),
            meterListPromise = appmodel.retrieveMeterList(),
            orbPromise = appmodel.retrieveTargetOrb();

        return Promise.all([meterListPromise, orbPromise]).then(function(results) {
            let errors = appmodel.getErrors();

            [metersByBuilding, orbInfo] = results;

            if (appmodel.getAuthError()) {
                return res.render('denied');
            }

            if (errors.noRecord) {
                return res.render('no-record');
            }

            if (!errors && Object.keys(form).length > 1) {
                return res.redirect('/dash/orb/success');
            }

            /**
             * @todo Check if all sample sizes are the same or not
             */
            if (orbInfo.daySets.isArray()) {
                orbInfo.daySets.forEach(function(daySet) {

                });
            }

            return res.render('orb-config', {
                loggedIn: loggedIn,
                errors: errors,
                form: Object.assign({}, orbInfo, form),
                buildings: metersByBuilding,
                days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                helpers: {
                    checked: function(array, haystackIndex, needle) {
                        let dataGrouping = [
                            [1, 2, 3, 4, 5, 6, 7]
                        ];

                        if (orbInfo && orbInfo.daySets) {
                            dataGrouping = orbInfo.daySets.map(function(set) {
                                return set.days;
                            });
                        }

                        if (dataGrouping[haystackIndex] && dataGrouping[haystackIndex].indexOf(needle + 1) > -1) {
                            return ' checked';
                        }
                    },

                    add: function(a, b) {
                        return a + b;
                    },

                    npoints: function(arr, key) {
                        return arr[key] && arr[key].npoints ? arr[key].npoints : null;
                    }
                }
            });
        });
    },

    success: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser();

        return res.render('orb-config-success', {
            loggedIn: loggedIn
        });
    },

    deletePrompt: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser(),
            orbPromise = appmodel.retrieveTargetOrb();

        return orbPromise.then(function(orbInfo) {
            let errors = appmodel.getErrors();

            if (appmodel.getAuthError()) {
                return res.render('denied');
            }

            if (errors.noRecord) {
                return res.render('no-record');
            }

            res.render('orb-delete-confirm', {
                loggedIn: loggedIn,
                orb: orbInfo
            });
        });
    },

    delete: function(res, appmodel) {
        res.redirect('/dash');
    }
};

module.exports = orbView;
