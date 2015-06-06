/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('TeamService',
        ['$http', 'API_URL', function ($http, API_URL) {

            return {
                createTeam: function (team) {
                    return $http.post(API_URL + 'teams/', team);
                },
                createUserTeam: function (userteam) {
                    return $http.post(API_URL + 'user-teams/', userteam);
                },
                createRoleTeam: function (roleteam) {
                    return $http.post(API_URL + 'role-teams/', roleteam);
                },
                getTeams: function () {
                    return $http.get(API_URL + 'teams/');
                },
                getUserTeams: function () {
                    return $http.get(API_URL + 'user-teams/');
                },
                getRoleTeams: function () {
                    return $http.get(API_URL + 'role-teams/');
                },
                getRoleTeamByTeam: function (teamId) {
                    return $http.get(API_URL + 'role-teams/', {
                        params: { teamId: teamId }
                    });
                },
                getTeam: function (teamId) {
                    return $http.get(API_URL + 'teams/' + teamId + '/');
                },
                updateTeam: function (team) {
                    return $http.put(API_URL + 'teams/' + team.id + '/', team);
                },
                updateUserTeam: function (userteam) {
                    return $http.put(API_URL + 'user-teams/' + userteam.id + '/', userteam);
                },
                updateRoleTeam: function (roleteam) {
                    return $http.put(API_URL + 'role-teams/' + roleteam.id + '/', roleteam);
                },
                deleteUserTeam: function (userteam) {
                    return $http.delete(API_URL + 'user-teams/' + userteam.id + '/');
                },
                deleteRoleTeam: function (roleteam) {
                    return $http.delete(API_URL + 'role-teams/' + roleteam.id + '/');
                },
                createUserTeamActivity: function (userteamactivity) {
                    return $http.post(API_URL + 'user-team-activities/', userteamactivity);
                },
                getUserTeamActivity: function () {
                    return $http.get(API_URL + 'user-team-activities/');
                }

            };
        }]);
}());