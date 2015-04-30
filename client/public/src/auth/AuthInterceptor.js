/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('AuthInterceptor',
        ['$localStorage', function ($localStorage) {return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($localStorage.token) {
                    config.headers.Authorization = 'JWT ' + $localStorage.token;
                }
                return config;
            }
        };
            }]);
}());

