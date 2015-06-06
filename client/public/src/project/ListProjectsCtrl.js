/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListProjectsCtrl',
        ['$scope', 'TeamService', 'ProjectService', function ($scope, TeamService, ProjectService) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
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
                        console.log("HE");
                        console.log(data);
                        $scope.getTeams();
                    });
            };

            $scope.getTeams = function () {
                TeamService.getTeams()
                    .success(function (data) {
                        Underscore.map($scope.projects, function (p) {
                            p.team_name = Underscore.find(data, function (t) {
                                return t.id === p.team;
                            }).name;
                        });
                        console.log($scope.projects);

                    });
            };
            $scope.getProjects();

            $scope.deleteProject = function (project) {
                /* TODO_: ČE OBSTAJAJO KARTICE ZA PROJEKT, SE TA LE DEAKTIVIRA, NE IZBRIŠE!!!

                project.is_active = false;
                ProjectService.updateProject(project);
                */

                $scope.projects = Underscore.without($scope.projects, project);

                ProjectService.deleteProject(project);

            };

            $scope.activateProject = function (project) {
                project.is_active = true;
                ProjectService.updateProject(project);
            };
        }]);
}());