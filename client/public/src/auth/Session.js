/*global angular, console */
(function () {
    'use strict';

    angular.module('scrumBan').service('Session',
        ['$http', 'API_URL',
            function ($http, API_URL) {
                var thisSession = this;
                thisSession.authenticated = false;

                this.createSession = function () {
                    return $http.get(API_URL + 'session/')
                        .success(function (data) {
                            thisSession.authenticated = (data.authenticated !== false);
                            thisSession.username = data.username;
                            thisSession.roles = data.groups;
                        })
                        .error(function () {
                            thisSession.authenticated = false;
                        });
                };

                this.destroy = function () {
                    thisSession.username = null;
                    thisSession.role = null;
                    thisSession.congregation = null;
                };

                return this;
            }]);
}());