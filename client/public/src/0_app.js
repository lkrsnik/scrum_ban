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
        'underscore'
    ]).
        config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/users', { templateUrl: '/static/html/user/listUsers.html', controller: 'ListUsersCtrl'})
                .when('/users/create', { templateUrl: '/static/html/user/createUser.html', controller: 'CreateUserCtrl'})
                .when('/users/:userId/edit', { templateUrl: '/static/html/user/editUser.html', controller: 'EditUserCtrl'})
                .when('/teams/create', { templateUrl: '/static/html/team/createTeam.html', controller: 'CreateTeamCtrl'})
                .when('/projects/create', { templateUrl: '/static/html/project/createProject.html', controller: 'CreateProjectCtrl'})
                .otherwise({redirectTo: '/'});
        }]);
}());