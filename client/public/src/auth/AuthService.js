/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('AuthService',
        ['$http', '$localStorage', function ($http, $localStorage) {
            return {
                login: function (credentials) {
                    return $http.post('/api-token-auth/', credentials)
                        .success(function (data) {
                            $localStorage.token = data.token;
                            //$location.path("/malaobcestva/ustvari");
                        })
                        .error(function () {
                            delete $localStorage.token;
                        });
                }
            };
        }]);
}());

