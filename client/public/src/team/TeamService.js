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
                }
            };
        }]);
}());