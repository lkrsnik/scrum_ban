/*global angular */
(function () {
    'use strict';

    // Declare app level module which depends on views, and components
    angular.module('scrumBan').
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider.otherwise({redirectTo: '/view1'});
        }]);
}());