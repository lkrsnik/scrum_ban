/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListUsersCtrl', ['$scope', 'UserService', 'ROLES', 'USERS', function ($scope, UserService, ROLES, USERS) {

        $scope.ROLES = ROLES;

        //console.log('List users');

        $scope.getUsers = function () {
            UserService.getUsers()
                .success(function (data) {
                    console.log(data);
                    //$scope.users = data;
                    $scope.users = USERS;
                });
        };

        $scope.getUsers();

        $scope.deleteUser = function (userId) {
            $scope.users = Underscore.filter($scope.users, function (user) { return user.id !== userId; });
        };
    }]);
}());