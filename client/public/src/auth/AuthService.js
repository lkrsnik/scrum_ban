/*global angular */
(function () {
    'use strict';
    angular.module('scrumBan').factory('AuthService',
        ['$http', '$location', '$localStorage', function ($http, $location, $localStorage) {
            return {
                login: function (credentials) {
                    return $http.post('/api-token-auth/', credentials)
                        .success(function (data) {
                            //console.log('User authenticated with token ' + data.token);
                            $localStorage.token = data.token;
                            $location.path("/malaobcestva/ustvari");
                        })
                        .error(function () {
                            delete $localStorage.token;
                        });
                }
            };
        }]);
}());

