/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateTeamCtrl',
        ['$scope', 'TeamService', 'UserService', function ($scope, TeamService, UserService) {

            $scope.greeting = 'Hello world';
            $scope.scrumMasters = {};
            $scope.teamMembers = {};
            $scope.productOwners = {};

            $scope.createTeam = function (team, productOwner, scrumMaster, members) {
                console.log('Creating team:');
                console.log(team);

                TeamService.createTeam(team)
                    .success(function () {
                        console.log('Team created');
                    });
            };

            $scope.getGroups = function () {
                UserService.getScrumMasters()
                    .success(function (data) {
                        console.log(JSON.stringify(data));
                        $scope.scrumMasters = data;
                    });
                UserService.getProductOwners()
                    .success(function (data) {
                        console.log(JSON.stringify(data));
                        $scope.productOwners = data;
                    });
                UserService.getTeamMembers()
                    .success(function (data) {
                        console.log(JSON.stringify(data));
                        $scope.teamMembers = data;
                    });
            };

            $scope.getGroups();

        }]);
}());