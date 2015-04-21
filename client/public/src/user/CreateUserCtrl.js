/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateUserCtrl',
        ['$scope', 'UserService', function ($scope, UserService) {

            $scope.greeting = 'Hello world';
            $scope.groups = {};

            $scope.createUser = function (user) {
                console.log('Creating user:');
                console.log(user);

                UserService.createUser(user)
                    .success(function () {
                        console.log('User created');
                    });
            };

            $scope.getGroups = function () {
                UserService.getGroups()
                    .success(function (data) {
                        console.log(JSON.stringify(data));
                        //$scope.users = data;
                        $scope.groups = data;
                        $scope.user = {
                            'group': data[0].id
                        };
                    });
            };

            $scope.getGroups();
        }]);
}());