/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListUsersCtrl',
        ['$scope', 'UserService', 'ROLES', function ($scope, UserService, ROLES) {

            $scope.ROLES = ROLES;

            //console.log('List users');

            $scope.getUsers = function () {
                UserService.getUsers()
                    .success(function (data) {
                        console.log(data);
                        //$scope.users = data;
                        $scope.users = data;
                    });
            };

            $scope.getUsers();

            $scope.getGroups = function () {
                UserService.getGroups()
                    .success(function (data) {
                        console.log(data);
                        //$scope.users = data;
                        $scope.groups = data;
                    });
            };

            $scope.getGroups();

            $scope.deleteUser = function (userId) {
                $scope.users = Underscore.filter($scope.users, function (user) { return user.id !== userId; });
            };
        }]);
}());