/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListTeamsCtrl',
        ['$scope', 'TeamService', function ($scope, TeamService) {

            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }

            //console.log('List teams');
            $scope.getTeams = function () {
                TeamService.getTeams()
                    .success(function (data) {
                        console.log(data);
                        $scope.teams = data;
                        console.log($scope.teams);
                        //$scope.users = Underscore.filter(data, function (user) { return user.is_active; });
                    });
            };
            $scope.getTeams();
            //$scope.getUsers();

            $scope.getGroups = function () {
                UserService.getGroups()
                    .success(function (data) {
                        console.log(data);
                        //$scope.users = data;
                        $scope.groups = data;
                    });
            };

            //$scope.getGroups();

            $scope.deleteUser = function (user) {
                user.is_active = false;
                UserService.updateUser(user);
            };

            $scope.activateUser = function (user) {
                user.is_active = true;
                UserService.updateUser(user);
            };
        }]);
}());