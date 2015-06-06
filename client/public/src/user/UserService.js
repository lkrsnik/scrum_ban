/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('UserService',
        ['$http', 'API_URL', function ($http, API_URL) {

            return {
                getGroups: function () {
                    return $http.get(API_URL + 'groups/');
                },

                getUser: function (userId) {
                    return $http.get(API_URL + 'users/' + userId + '/');
                },
                getUsers: function () {
                    return $http.get(API_URL + 'users/');
                },
                createUser: function (user) {
                    return $http.post(API_URL + 'users/', user);
                },
                updateUser: function (user) {
                    return $http.put(API_URL + 'users/' + user.id + '/', user);
                }
            };
        }]);
}());