/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('LoginCtrl', 
        ['$scope', 'AuthService', '$localStorage', '$location', function ($scope, AuthService, $localStorage, $location) {
        $scope.resetCredentialsValidity = function () {
            $scope.loginForm.password.$setValidity('wrongCredentials', true);
        };

        $scope.login = function (credentials) {
            /*jslint unparam: true*/
            AuthService.login(credentials)
                .success(function () {
                    if ($localStorage.ip === undefined || !$localStorage.ip.locked) {
                        $scope.updateSessionView();
                        delete $localStorage.ip;
						$location.path('/');
                    } else {
                        if ($localStorage.ip.locked_time - (new Date()).getTime() < -20 * 1000) {
                            $scope.updateSessionView();
                            delete $localStorage.ip;
							$location.path('/');
                        } else {
                            delete $localStorage.token;
                            $scope.loginForm.password.$setValidity('wrongCredentials', false);
                        }
                    }
                })
                .error(function (error, status) {
                    // fake ip locking :-)   
                    if ($localStorage.ip === undefined) {
                        $localStorage.ip = {};
                        $localStorage.ip.tryout = 1;
                        $localStorage.ip.locked = false;
                    } else {
                        if ($localStorage.ip.locked_time === undefined || ($localStorage.ip.locked_time - (new Date()).getTime()) < -20 * 1000) {
                            $localStorage.ip.tryout = $localStorage.ip.tryout + 1;
                            if ($localStorage.ip.tryout >= 3) {
                                $localStorage.ip.locked = true;
                                $localStorage.ip.locked_time = (new Date()).getTime();
                            }
                        } else {
                            $scope.loginForm.password.$setValidity('wrongCredentials', false);
                        }
                    }
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