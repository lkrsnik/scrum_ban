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
                },
                getTeam: function (teamId) {
                    return $http.get(API_URL + 'teams/' + teamId + '/')
                        .error(function (error, status) {
                            console.log('Error in retrieving team: ' + status);
                            console.log(error);
                        });
                },
                updateTeam: function (team) {
                    console.log(team);
                    return $http.put(API_URL + 'teams/' + team.id + '/', team)
                        .error(function (error, status) {
                            console.log('Error in updating team: ' + status);
                            console.log(error);
                        });
                },
                updateUserTeam: function (userteam) {
                    console.log(userteam);
                    return $http.put(API_URL + 'user-teams/' + userteam.id + '/', userteam)
                        .error(function (error, status) {
                            console.log('Error in updating user team: ' + status);
                            console.log(error);
                        });
                },
                updateRoleTeam: function (roleteam) {
                    console.log(roleteam);
                    return $http.put(API_URL + 'role-teams/' + roleteam.id + '/', roleteam)
                        .error(function (error, status) {
                            console.log('Error in updating role team: ' + status);
                            console.log(error);
                        });
                },
                deleteUserTeam: function (userteam) {
                    console.log(userteam);
                    return $http.delete(API_URL + 'user-teams/' + userteam.id + '/')
                        .error(function (error, status) {
                            console.log('Error in deleting user team: ' + status);
                            console.log(error);
                        });
                },
                deleteRoleTeam: function (roleteam) {
                    console.log(roleteam);
                    return $http.delete(API_URL + 'role-teams/' + roleteam.id + '/')
                        .error(function (error, status) {
                            console.log('Error in deleting role team: ' + status);
                            console.log(error);
                        });
                },
                createUserTeamActivity: function (userteamactivity) {
                    return $http.post(API_URL + 'user-team-activities/', userteamactivity)
                        .error(function (error, status) {
                            console.log('Error in creating user team activity: ' + status);
                            console.log(error);
                        });
                }

            };
        }]);
}());