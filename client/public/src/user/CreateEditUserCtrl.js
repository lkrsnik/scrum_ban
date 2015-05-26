/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateEditUserCtrl',
        ['$scope', 'UserService', '$routeParams', '$location', function ($scope, UserService, $routeParams, $location) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
                    .then(function () {
                        $scope.redirectNonAdmin('/');
                        $scope.redirectNonAuthenticated('/');
                    }, function () { // In case session promise fails
                        $scope.redirectNonAdmin('/');
                        $scope.redirectNonAuthenticated('/');
                    });
            } else {
                $scope.redirectNonAuthenticated('/');
                $scope.redirectNonAdmin('/');
            }

            $scope.createOrEdit = ($routeParams.userId === undefined) ? 'create' : 'edit';
            $scope.groups = {};

            $scope.resetEmailValidity = function () {
                $scope.createUserForm.email.$setValidity('emailExists', true);
            };

            $scope.createUser = function (user) {
                user.username = user.email;
                user.groups = Underscore.filter($scope.groups, function (group) { return group.selected; });

                //console.log('Creating user:');
                //console.log(user);

                UserService.createUser(user)
                    .success(function () {
                        //console.log('User created');
                        $location.path('/users/');
                    })
                    .error(function (error, status) {
                        switch (status) {
                        case (400):
                            if (error.username &&
                                    error.username.indexOf('User with this Username already exists.')) {
                                $scope.createUserForm.email.$setValidity('emailExists', false);
                            }

                            //$scope.createUserForm.email.$setValidity('emailExists', false);
                            break;
                        }
                    });
            };

            $scope.updateUser = function (user) {
                user.username = user.email;
                user.groups = Underscore.filter($scope.groups, function (group) { return group.selected; });
                // Save only group names
                user.groups = Underscore.map(user.groups, function (group) { return group.name; });

                if (user.password === '') {
                    delete user.password;
                    console.log(user);
                }
                //console.log('Updating user:');
                console.log(user);

                UserService.updateUser(user)
                    .success(function () {
                        //console.log('User updated');
                        $location.path('/users/');
                    });
            };

            $scope.getUser = function (userId) {
                UserService.getUser(userId)
                    .success(function (data) {
                        $scope.user = data;

                        // Update group selection
                        $scope.groups = Underscore.map(
                            $scope.groups,
                            function (g) {
                                if (Underscore.contains($scope.user.groups, g.name)) {
                                    g.selected = true;
                                }
                                return g;
                            }
                        );
                    });
            };

            $scope.getGroups = function () {
                UserService.getGroups()
                    .success(function (data) {
                        $scope.groups = data;

                        if ($scope.createOrEdit === 'edit') {
                            $scope.getUser($routeParams.userId);
                        }
                    });
            };

            $scope.getGroups();

            $scope.saveUser = function (user) {
                if ($scope.createOrEdit === 'create') {
                    $scope.createUser(user);
                } else {
                    $scope.updateUser(user);
                }
            };
        }]);
}());