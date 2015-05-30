/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListProjectsCtrl',
        ['$scope', 'TeamService', 'ProjectService', function ($scope, TeamService, ProjectService) {

            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }
            $scope.projects = null;

            $scope.getProjects = function () {
                ProjectService.getProjects()
                    .success(function (data) {
                        console.log(data);
                        $scope.projects = data;
                        $scope.getTeams();
                    });
            };

            $scope.getTeams = function () {
                TeamService.getTeams()
                    .success(function (data) {
                        Underscore.map($scope.projects, function (p) {
                            p.team = Underscore.find(data, function (t) {
                                return t.id === p.team;
                            }).name;
                        });
                        console.log($scope.projects);

                    });
            };
            $scope.getProjects();

            /*
            $scope.deleteUser = function (user) {
                user.is_active = false;
                UserService.updateUser(user);
            };

            $scope.activateUser = function (user) {
                user.is_active = true;
                UserService.updateUser(user);
            }; */
        }]);
}());