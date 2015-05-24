/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('AppCtrl',
        ['$scope', '$q', 'Session', '$location', '$localStorage', function ($scope, $q, Session, $location, $localStorage) {
            $scope.promises = {
                sessionPromise: $q.defer().promise
            };

            $scope.updateSessionView = function () {
                if (Session.isLoaded) {
                    $scope.session = Session;
                } else {
                    $scope.promises.sessionPromise = Session.createSession()
                        .success(function () {
                            $scope.session = Session;
                        })
                        .error(function () {
                            $scope.session = Session;
                        });
                }
            };
            $scope.updateSessionView();

            $scope.redirectNonAdmin = function (link) {
                if ($scope.session && $scope.session.username !== 'admin') {
                    //console.log('Nimate ustreznih pooblastil za ogled te strani.');
                    $location.path(link);
                }
            };

            $scope.redirectNonScrumMaster = function (link) {
                var userRoles = $scope.session.roles,
                    isScrumMaster = false,
                    i;
                for (i = 0; i < userRoles.length; i += 1) {
                    if (userRoles[i].name === "ScrumMaster") {
                        isScrumMaster = true;
                        break;
                    }
                }
                if (!(isScrumMaster || ($scope.session.username === 'admin'))) {
                    $location.path(link);
                }
            };

            $scope.redirectNonAuthenticated = function (link) {
                if ($scope.session && !$scope.session.authenticated) {
                    $location.path(link);
                }
            };

            $scope.logout = function () {
                delete $localStorage.token;
                $scope.updateSessionView();
                $location.path("/");
            };
        }]);
}());