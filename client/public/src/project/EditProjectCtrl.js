/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('EditProjectCtrl',
        ['$scope', '$filter', 'ProjectService', 'TeamService', 'BoardService', '$routeParams',  '$location', function ($scope, $filter, ProjectService, TeamService, BoardService, $routeParams, $location) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }

            $scope.project = null;
            $scope.hasStarted = false;
            $scope.today = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.getTeams = function () {
                TeamService.getTeams()
                    .success(function (data) {
                        $scope.teams = data;
                        $scope.getProject();
                    });
            };

            $scope.getProject = function () {
                ProjectService.getProject($routeParams.projectId)
                    .success(function (data) {
                        $scope.project = data;
                        $scope.project.start_date =  $filter('date')(data.start_date, 'yyyy-MM-dd');
                        $scope.project.end_date =  $filter('date')(data.end_date, 'yyyy-MM-dd');
                        $scope.project.team = Underscore.find($scope.teams, function (t) {
                            return t.id === $scope.project.team;
                        });
                        BoardService.getCards()
                            .success(function (data) {
                                var cards;
                                cards = Underscore.filter(data, function (c) {
                                    return c.project === $scope.project.id;
                                });
                                if (cards.length > 0) {
                                    $scope.hasStarted = true;
                                }
                            });
                    });
            };

            $scope.validateStartDate = function () {
                if ($filter('date')($scope.project.start_date, 'yyyy-MM-dd') <= ($scope.today)) {
                    $scope.createProjectForm.start_date.$setValidity('startBeforeToday', true);
                } else {
                    $scope.createProjectForm.start_date.$setValidity('startBeforeToday', false);
                }
                $scope.validateEndDate();
            };

            $scope.validateEndDate = function () {
                if ($scope.project.end_date < $scope.project.start_date || $scope.project.end_date < $scope.today) {
                    $scope.createProjectForm.end_date.$setValidity('finishBeforeStart', false);
                } else {
                    $scope.createProjectForm.end_date.$setValidity('finishBeforeStart', true);
                }
            };

            $scope.getTeams();
            $scope.editProject = function (project) {
                project.team = project.team.id;
                project.start_date = $filter('date')(project.start_date, 'yyyy-MM-ddTHH:mm');
                project.end_date = $filter('date')(project.end_date, 'yyyy-MM-ddTHH:mm');
                project.is_active = $scope.project.is_active;
                ProjectService.updateProject(project)
                    .success(function () {
                        $location.path('/projects/');
                    });
            };
        }]);
}());