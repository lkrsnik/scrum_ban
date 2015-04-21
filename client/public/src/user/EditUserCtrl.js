/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('EditUserCtrl', ['$scope', '$routeParams', 'ROLES', 'USERS', function ($scope, $routeParams, ROLES, USERS) {

        $scope.ROLES = ROLES;
        $scope.user = {};

        $scope.updateUser = function (user) {
            console.log('Updating user:');
            console.log(user);
        };

        $scope.getUser = function (userId) {
            $scope.user = Underscore.findWhere(USERS, { id: parseInt(userId, 10) });
        };

        if ($routeParams.userId) {
            $scope.getUser($routeParams.userId);
        }
    }]);
}());