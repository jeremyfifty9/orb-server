let authenticationView = {
    authorize: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser(),
            redirectAddress = appmodel.getRedirectAddress(),
            errors = appmodel.getErrors();

        if (!loggedIn) {
            return res.render('denied');
        }

        if (errors) {
            return res.render('no-record');
        }

        return res.redirect(redirectAddress);
    },

    redirect: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser(),
            errors = appmodel.getErrors();

        if (!loggedIn) {
            return res.render('denied');
        }

        return res.render('auth-redirect', {
            loggedIn: loggedIn,
            errors: errors,
            integration: appmodel.getIntegration()
        });
    },

    confirm: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser(),
            integrationId = appmodel.getIntegration();

        if (!loggedIn) {
            return res.render('denied');
        }

        return res.render('auth-confirm', {
            loggedIn: loggedIn,
            integrationId: integrationId
        });
    },

    label: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser(),
            form = appmodel.getInputs(),
            targetIntegrationPromise = appmodel.retrieveTargetIntegration();

        targetIntegrationPromise.then(function(integration){
            let errors = appmodel.getErrors();

            if (appmodel.getAuthError()) {
                return res.render('denied');
            }

            if (errors.noRecord) {
                return res.render('no-record');
            }

            if(!errors && Object.keys(form).length > 1) {
                return res.redirect('/auth/label/success');
            }

            return res.render('auth-label', {
                loggedIn: loggedIn,
                form: Object.assign({}, integration, form),
                errors: errors,
                integration: appmodel.getIntegration()
            });
        });
    },

    success: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser();

        return res.render('auth-success', {
            loggedIn: loggedIn
        });
    },

    deletePrompt: function(res, appmodel) {
        let loggedIn = appmodel.getAuthenticatedUser(),
            integrationPrompise = appmodel.retrieveTargetIntegration();

        return integrationPrompise.then(function(integration) {
            let errors = appmodel.getErrors();
            
            if (appmodel.getAuthError()) {
                return res.render('denied');
            }

            if (errors.noRecord) {
                return res.render('no-record');
            }

            res.render('auth-delete-confirm', {
                loggedIn: loggedIn,
                integration: integration
            });
        });
    },

    delete: function(res, appmodel) {
        res.redirect('/account');
    }
};

module.exports = authenticationView;
