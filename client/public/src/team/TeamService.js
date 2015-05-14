/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('TeamService',
        ['$http', 'API_URL', function ($http, API_URL) {

            return {
                createTeam: function (team) {
                    console.log(team);
                    return $http.post(API_URL + 'teams/', team)
                        .error(function (error, status) {
                            console.log('Error in creating team: ' + status);
                            console.log(error);
                        });
                },
                createUserTeam: function (userteam) {
                    console.log(userteam);
                    return $http.post(API_URL + 'user-teams/', userteam)
                        .error(function (error, status) {
                            console.log('Error in creating user team: ' + status);
                            console.log(error);
                        });
                },
                createRoleTeam: function (roleteam) {
                    console.log(roleteam);
                    return $http.post(API_URL + 'role-teams/', roleteam)
                        .error(function (error, status) {
                            console.log('Error in creating user team: ' + status);
                            console.log(error);
                        });
                },
                getTeams: function () {
                    return $http.get(API_URL + 'teams/')
                        .error(function (error, status) {
                            console.log('Error in retrieving teams: ' + status);
                            console.log(error);
                        });
                },
                getUserTeams: function () {
                    return $http.get(API_URL + 'user-teams/')
                        .error(function (error, status) {
                            console.log('Error in retrieving user teams: ' + status);
                            console.log(error);
                        });
                },
                getRoleTeams: function () {
                    return $http.get(API_URL + 'role-teams/')
                        .error(function (error, status) {
                            console.log('Error in retrieving role teams: ' + status);
                            console.log(error);
                        });
                }
            };
        }]);
}());