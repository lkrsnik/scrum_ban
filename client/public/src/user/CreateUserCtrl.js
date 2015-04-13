/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateUserCtrl', ['$scope', 'ROLES', function ($scope, ROLES) {

        $scope.ROLES = ROLES;

        $scope.createUser = function (user) {
            console.log('Creating user:');
            console.log(user);
        };
    }]);
}());