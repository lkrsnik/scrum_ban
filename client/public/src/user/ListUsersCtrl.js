/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListUsersCtrl',
        ['$scope', 'UserService', 'ROLES', function ($scope, UserService, ROLES) {

            $scope.ROLES = ROLES;

            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonAdmin('/');
                    });
            } else {
                $scope.redirectNonAdmin('/');
            }

            //console.log('List users');

            $scope.getUsers = function () {
                UserService.getUsers()
                    .success(function (data) {
                        console.log(data);
                        $scope.users = data;
                        //$scope.users = Underscore.filter(data, function (user) { return user.is_active; });
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

            $scope.deleteUser = function (user) {
                user.is_active = false;
                UserService.updateUser(user);
            };

            $scope.activateUser = function (user) {
                user.is_active = true;
                UserService.updateUser(user);
            };
        }]);
}());