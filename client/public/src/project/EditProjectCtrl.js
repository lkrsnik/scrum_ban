/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('EditProjectCtrl',
        ['$scope', '$filter', 'ProjectService', 'TeamService', '$routeParams',  '$location', function ($scope, $filter, ProjectService, TeamService, $routeParams, $location) {

            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }

            $scope.project = null;
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
                        // TODO_: ČE ŽE OBSTAJAJO KARTICE NA PROJEKTU, NI MOČ VEČ SPREMENITI DATUMA PROJEKTA!!!
                    });
            };

            $scope.validateStartDate = function () {
                if ($scope.project.start_date <= $scope.today) {
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
                console.log(project);
                project.team = project.team.id;
                project.board = null;
                console.log(project.start_date);
                project.start_date = $filter('date')(project.start_date, 'yyyy-MM-ddTHH:mm');
                console.log(project.start_date);
                project.end_date = $filter('date')(project.end_date, 'yyyy-MM-ddTHH:mm');
                project.is_active = $scope.project.is_active;
                ProjectService.updateProject(project)
                    .success(function (dataTeam) {
                        console.log(dataTeam);
                        $location.path('/projects/');
                    });
            };
        }]);
}());