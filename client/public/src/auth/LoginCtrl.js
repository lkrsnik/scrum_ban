/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('LoginCtrl', ['$scope', 'AuthService', function ($scope, AuthService) {
        $scope.login = function (credentials) {
            AuthService.login(credentials)
                .success(function () {
                    console.log("SUCCESS!!!");
                    //$scope.updateSessionView();
                })
                .error(function (status) {
                    switch (status) {
                    case (400):
                        $scope.loginForm.username.$setValidity('wrongCredentials', false);
                        break;
                    }
                });
        };
    }]);
}());