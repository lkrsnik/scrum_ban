/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateProjectCtrl',
        ['$scope', '$filter', 'ProjectService', 'TeamService', '$location', function ($scope, $filter, ProjectService, TeamService, $location) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
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
                if ($filter('date')($scope.project.start_date, 'yyyy-MM-dd') <= ($scope.today)) {
                    $scope.createProjectForm.start_date.$setValidity('startBeforeToday', true);
                } else {
                    $scope.createProjectForm.start_date.$setValidity('startBeforeToday', false);
                }
                $scope.validateEndDate();
            };

            $scope.validateEndDate = function () {
                var endDate = $filter('date')($scope.project.end_date, 'yyyy-MM-ddTHH:mm'),
                    startDate = $filter('date')($scope.project.start_date, 'yyyy-MM-ddTHH:mm');
                if (endDate < startDate || endDate < $scope.today) {
                    $scope.createProjectForm.end_date.$setValidity('finishBeforeStart', false);
                } else {
                    $scope.createProjectForm.end_date.$setValidity('finishBeforeStart', true);
                }
            };

            $scope.getTeams();
            $scope.createProject = function (project) {
                project.team = project.team.id;
                project.board = null;
                project.start_date = $filter('date')(project.start_date, 'yyyy-MM-ddTHH:mm');
                project.end_date = $filter('date')(project.end_date, 'yyyy-MM-ddTHH:mm');
                ProjectService.createProject(project)
                    .success(function () {
                        $location.path('/projects/');
                    });
            };
        }]);
}());