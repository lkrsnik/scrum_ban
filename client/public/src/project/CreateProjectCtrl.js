/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateProjectCtrl',
        ['$scope', '$filter', 'ProjectService', 'TeamService', function ($scope, $filter, ProjectService, TeamService) {

            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }
            
            $scope.getTeams = function () {
                TeamService.getTeams()
                    .success(function (data) {
                        $scope.teams = data;
                    });
            };

            $scope.project = {};
            $scope.today = $filter('date')(new Date(), 'yyyy-MM-dd');

            $scope.validateStartDate = function () {
                if ($scope.project.start_date < $scope.today) {
                    $scope.createProjectForm.start_date.$setValidity('startBeforeToday', false);
                } else {
                    $scope.createProjectForm.start_date.$setValidity('startBeforeToday', true);
                }
                $scope.validateEndDate();
            };

            $scope.validateEndDate = function () {
                if ($scope.project.end_date < $scope.project.start_date) {
                    $scope.createProjectForm.end_date.$setValidity('finishBeforeStart', false);
                } else {
                    $scope.createProjectForm.end_date.$setValidity('finishBeforeStart', true);
                }
            };

            $scope.getTeams();
            $scope.createProject = function (project) {
                console.log(project);
                project.team = project.team.id;
                project.board = null;
                console.log(project.start_date);
                project.start_date = $filter('date')(project.start_date, 'yyyy-MM-ddTHH:mm');
                console.log(project.start_date);
                project.end_date = $filter('date')(project.end_date, 'yyyy-MM-ddTHH:mm');
                ProjectService.createProject(project)
                    .success(function (dataTeam) {
                        console.log(dataTeam);
                    });
            };
        }]);
}());