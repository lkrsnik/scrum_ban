/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListUsersCtrl', ['$scope', 'UserService', 'ROLES', function ($scope, UserService, ROLES) {

        $scope.ROLES = ROLES;

        $scope.getUsers = function () {
            UserService.getUsers()
                .success(function (data) {
                    ////console.log(data);
                    $scope.users = data;
                });
        };
    }]);
}());