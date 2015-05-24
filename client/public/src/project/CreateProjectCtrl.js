/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateProjectCtrl',
        ['$scope', '$filter', 'ProjectService', 'TeamService', function ($scope, $filter, ProjectService, TeamService) {
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
                project.start_date = $filter('date')(theme.start_date_web_training, 'yyyy-MM-dd');
                ProjectService.createProject(project)
                    .success(function (dataTeam) {
                        console.log("parteeey");
                    });
            };

        }]);
}());