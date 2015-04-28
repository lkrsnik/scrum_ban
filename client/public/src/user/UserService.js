/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('UserService',
        ['$http', 'API_URL', function ($http, API_URL) {

            return {
                getGroups: function () {
                    return $http.get(API_URL + 'groups/')
                        .error(function (error, status) {
                            console.log('Error in retrieving groups: ' + status);
                            console.log(error);
                        });
                },

                getUsers: function () {
                    return $http.get(API_URL + 'users/')
                        .error(function (error, status) {
                            console.log('Error in retrieving users: ' + status);
                            console.log(error);
                        });
                },
                createUser: function (user) {
                    return $http.post(API_URL + 'users/', user);
                },
                updateUser: function (user) {
                    return $http.put(API_URL + 'users/' + user.id + '/', user)
                        .error(function (error, status) {
                            console.log('Error in deleting user: ' + status);
                            console.log(error);
                        });
                }
            };
        }]);
}());