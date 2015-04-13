/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateUserCtrl',
        ['$scope', 'UserService', 'ROLES', function ($scope, UserService, ROLES) {

            $scope.ROLES = ROLES;

            $scope.createUser = function (user) {
                console.log('Creating user:');
                console.log(user);

                UserService.createUser(user)
                    .success(function () {
                        console.log('User created');
                    });
            };
        }]);
}());