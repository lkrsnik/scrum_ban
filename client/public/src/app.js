/*global angular */
(function () {
    'use strict';

    // Declare app level module which depends on views, and components
    angular.module('scrumBan', [
        'ngRoute'
    ]).
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/users/create', { templateUrl: '/static/html/user/createUser.html', controller: 'CreateUserCtrl'})
                .otherwise({redirectTo: '/'});
        }]);
}());