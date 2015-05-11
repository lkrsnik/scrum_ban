/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('LoginCtrl', 
        ['$scope', 'AuthService', '$location', function ($scope, AuthService, $location) {
        $scope.resetCredentialsValidity = function () {
            $scope.loginForm.password.$setValidity('wrongCredentials', true);
        };

        $scope.login = function (credentials) {
            /*jslint unparam: true*/
            AuthService.login(credentials)
                .success(function () {
                    $scope.updateSessionView();
                    $location.path('/');
                })
                .error(function (error, status) {
                    switch (status) {
                    case (400):
                        $scope.loginForm.password.$setValidity('wrongCredentials', false);
                        break;
                    }
                });
            /*jslint unparam: false*/
        };
    }]);
}());