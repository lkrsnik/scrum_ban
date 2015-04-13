/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('UserService',
        ['$http', function ($http) {

            return {
                getUsers: function () {
                    return $http.get('users/')
                        .error(function (error, status) {
                            console.log('Error in retrieving users: ' + status);
                            console.log(error);
                        });
                }
            };
        }]);
}());