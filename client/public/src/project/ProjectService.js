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
                }
                
            };
        }]);
}());