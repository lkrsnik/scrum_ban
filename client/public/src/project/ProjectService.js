/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('ProjectService',
        ['$http', 'API_URL', function ($http, API_URL) {
            return {
                createProject: function (project) {
                    return $http.post(API_URL + 'projects/', project)
                        .error(function (error, status) {
                            console.log('Error in creating team: ' + status);
                            console.log(error);
                        });
                },
                getProjects: function () {
                    return $http.get(API_URL + 'projects/')
                        .error(function (error, status) {
                            console.log('Error in retrieving projects: ' + status);
                            console.log(error);
                        });
                },
                getProject: function (projectId) {
                    return $http.get(API_URL + 'projects/' + projectId + '/')
                        .error(function (error, status) {
                            console.log('Error in retrieving project: ' + status);
                            console.log(error);
                        });
                },
                getProjectbyBoardUser: function (boardId) {
                    return $http.get(API_URL + 'projects/', {
                        params: { boardId: boardId }
                    })
                        .error(function (error, status) {
                            console.log('Error in retrieving role teams: ' + status);
                            console.log(error);
                        });
                },
                getProjectbyBoardUserRole: function (boardId, role) {
                    return $http.get(API_URL + 'projects/', {
                        params:
                            {
                                boardId: boardId,
                                role : role
                            }
                    })
                        .error(function (error, status) {
                            console.log('Error in retrieving role teams: ' + status);
                            console.log(error);
                        });
                },
                updateProject: function (project) {
                    console.log(project);
                    return $http.put(API_URL + 'projects/' + project.id + '/', project)
                        .error(function (error, status) {
                            console.log('Error in updating project: ' + status);
                            console.log(error);
                        });
                },
                deleteProject: function (project) {
                    console.log(project);
                    return $http.delete(API_URL + 'projects/' + project.id + '/')
                        .error(function (error, status) {
                            console.log('Error in deleting project: ' + status);
                            console.log(error);
                        });
                }
            };
        }]);
}());