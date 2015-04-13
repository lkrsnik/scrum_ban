/*global angular */
(function () {
    'use strict';

    // Declare app level module which depends on views, and components
    angular.module('scrumBan', [
        'ngRoute'
    ]).
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/users', { templateUrl: '/static/html/user/listUsers.html', controller: 'ListUsersCtrl'})
                .when('/users/create', { templateUrl: '/static/html/user/createUser.html', controller: 'CreateUserCtrl'})
                .otherwise({redirectTo: '/'});
        }]);
}());