/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListUsersCtrl',
        ['$scope', 'UserService', 'ROLES', function ($scope, UserService, ROLES) {

            $scope.ROLES = ROLES;

            if (!$scope.session) {
                $scope.promises.sessionPromise
                    .then(function () {
                        $scope.redirectNonAuthenticated('/');
                        $scope.redirectNonAdmin('/');
                    }, function () {  // In case session promise fails
                        $scope.redirectNonAdmin('/');
                        $scope.redirectNonAuthenticated('/');
                    });
            } else {
                $scope.redirectNonAuthenticated('/');
                $scope.redirectNonAdmin('/');
            }

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