/*global angular, Underscore: true */
/* jshint ignore: start */
var Underscore;
/* jshint ignore: end */
(function () {
    'use strict';

    /*jslint nomen: true*/
    /*global _*/
    Underscore = _;
    /*jslint nomen: false*/

    // Declare app level module which depends on views, and components
    angular.module('scrumBan', [
        'ngRoute',
        'underscore',
        'ngStorage'
    ]).
        config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
            $routeProvider
                .when('/users', { templateUrl: '/static/html/user/listUsers.html', controller: 'ListUsersCtrl'})
                .when('/users/create', { templateUrl: '/static/html/user/createEditUser.html', controller: 'CreateEditUserCtrl'})
                .when('/users/:userId/edit', { templateUrl: '/static/html/user/createEditUser.html', controller: 'CreateEditUserCtrl'})

                .when('/boards/create', { templateUrl: '/static/html/board/createBoard.html', controller: 'CreateBoardCtrl' })

                .when('/login', { templateUrl: '/static/html/auth/login.html', controller: 'LoginCtrl'})

                .otherwise({redirectTo: '/'});
            $httpProvider.interceptors.push('AuthInterceptor');
        }]);
}());