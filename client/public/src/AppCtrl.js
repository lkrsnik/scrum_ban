/*global angular */
(function () {
    'use strict';
    angular.module('scrumBan').controller('AppCtrl', 'AuthService', ['$scope', function ($scope, AuthService) {
        $scope.login = function () {
            AuthService.login($scope.user)
                .success(function () {
                    $scope.updateSessionView();
                })
                .error(function (status) {
                    /*switch (status) {
                    case (400):
                        {
                        $scope.loginForm.username.$setValidity('wrongCredentials', false);
                        break;
                        }
                    } */
                });
        };
    }]);
}());