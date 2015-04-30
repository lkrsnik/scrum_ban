/*global angular, Underscore: true */
var Underscore;
(function () {
    'use strict';

    /*jslint nomen: true */
    /*global _ */
    Underscore = _;
    /*jslint nomen: false */

    // Declare app level module which depends on views, and components
    angular.module('scrumBan', [
        'ngRoute',
        'underscore',
        'ngStorage'
    ]).
        config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
            $routeProvider
                .when('/users', { templateUrl: '/static/html/user/listUsers.html', controller: 'ListUsersCtrl'})
                .when('/login', { templateUrl: '/static/html/auth/login.html', controller: 'LoginCtrl'})
                .when('/users/create', { templateUrl: '/static/html/user/createUser.html', controller: 'CreateUserCtrl'})
                .when('/users/:userId/edit', { templateUrl: '/static/html/user/editUser.html', controller: 'EditUserCtrl'})
                .otherwise({redirectTo: '/'});
            $httpProvider.interceptors.push('AuthInterceptor');
        }]);
}());