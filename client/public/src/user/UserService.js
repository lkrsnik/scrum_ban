/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('UserService',
        ['$http', 'API_URL', function ($http, API_URL) {

            return {
                getUsers: function () {
                    return $http.get(API_URL + 'users/')
                        .error(function (error, status) {
                            console.log('Error in retrieving users: ' + status);
                            console.log(error);
                        });
                },
                createUser: function (user) {
                    return $http.post(API_URL + 'users/', user)
                        .error(function (error, status) {
                            console.log('Error in creating user: ' + status);
                            console.log(error);
                        });
                }
            };
        }]);
}());