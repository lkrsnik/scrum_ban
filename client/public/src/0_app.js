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
        'ngStorage',
        'ngDialog',
        'ngDraggable'
    ]).
        config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
            $routeProvider
                .when('/users', { templateUrl: '/static/html/user/listUsers.html', controller: 'ListUsersCtrl'})
                .when('/users/create', { templateUrl: '/static/html/user/createEditUser.html', controller: 'CreateEditUserCtrl'})
                .when('/users/:userId/edit', { templateUrl: '/static/html/user/createEditUser.html', controller: 'CreateEditUserCtrl'})

                .when('/boards', { templateUrl: '/static/html/board/listBoards.html', controller: 'ListBoardsCtrl' })
                .when('/boards/create', { templateUrl: '/static/html/board/createBoard.html', controller: 'CreateBoardCtrl' })
                .when('/boards/:boardId', { templateUrl: '/static/html/board/board.html', controller: 'BoardCtrl' })

                .when('/login', { templateUrl: '/static/html/auth/login.html', controller: 'LoginCtrl'})
                .when('/teams', { templateUrl: '/static/html/team/listTeams.html', controller: 'ListTeamsCtrl'})
                .when('/teams/create', { templateUrl: '/static/html/team/createTeam.html', controller: 'CreateTeamCtrl'})
                .when('/teams/:teamId/edit', { templateUrl: '/static/html/team/editTeam.html', controller: 'EditTeamCtrl'})
                .when('/projects/create', { templateUrl: '/static/html/project/createProject.html', controller: 'CreateProjectCtrl'})
                .when('/projects', { templateUrl: '/static/html/project/listProjects.html', controller: 'ListProjectsCtrl'})
                .when('/projects/:projectId/edit', { templateUrl: '/static/html/project/editProject.html', controller: 'EditProjectCtrl'})
                .otherwise({redirectTo: '/'});
            $httpProvider.interceptors.push('AuthInterceptor');
        }]);
}());