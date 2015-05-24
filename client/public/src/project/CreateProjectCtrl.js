/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateProjectCtrl',
        ['$scope', 'ProjectService', 'TeamService', function ($scope, ProjectService, TeamService) {
            $scope.getTeams = function () {
                TeamService.getTeams()
                    .success(function (data) {
                        $scope.teams = data;
                    });
            };
            $scope.getTeams();
            $scope.createProject = function (project) {
                console.log(project);
                project.team = project.team.id;
                project.board = null;
                ProjectService.createProject(project)
                    .success(function (dataTeam) {
                        console.log("parteeey");
                    });
            };

        }]);
}());