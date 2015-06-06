/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('ProjectService',
        ['$http', 'API_URL', function ($http, API_URL) {
            return {
                createProject: function (project) {
                    return $http.post(API_URL + 'projects/', project);
                },
                getProjects: function () {
                    return $http.get(API_URL + 'projects/');
                },
                getProject: function (projectId) {
                    return $http.get(API_URL + 'projects/' + projectId + '/');
                },
                getProjectbyBoardUser: function (boardId) {
                    return $http.get(API_URL + 'projects/', {
                        params: { boardId: boardId }
                    });
                },
                getProjectbyBoardUserRole: function (boardId, role) {
                    return $http.get(API_URL + 'projects/', {
                        params:
                            {
                                boardId: boardId,
                                role : role
                            }
                    });
                },
                updateProject: function (project) {
                    return $http.put(API_URL + 'projects/' + project.id + '/', project);
                },
                deleteProject: function (project) {
                    return $http.delete(API_URL + 'projects/' + project.id + '/');
                }
            };
        }]);
}());