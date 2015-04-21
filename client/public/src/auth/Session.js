/*global angular */
(function () {
    'use strict';

    angular.module('scrumBan').service('Session',
        ['$http', 'API_URL',
            function ($http, API_URL) {
                var thisSession = this;
                thisSession.authenticated = false;

                this.createSession = function () {
                    return $http.get(API_URL + 'me/')
                        .success(function (data) {
                            thisSession.authenticated = true;
                            thisSession.userId = data.user_id;
                            thisSession.role = data.role;
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