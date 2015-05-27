/*global angular, console, Underscore */
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

            $scope.redirect = function (link) {
                $location.path(link);
            };

            $scope.redirectNonAdmin = function (link) {
                if ($scope.session && !Underscore.contains($scope.session.roles, 'Admin')) {
                    //console.log('Nimate ustreznih pooblastil za ogled te strani.');
                    $scope.redirect(link);
                }
            };

            $scope.redirectNonAuthenticated = function (link) {
                if ($scope.session && !$scope.session.authenticated) {
                    $scope.redirect(link);
                }
            };

            $scope.logout = function () {
                delete $localStorage.token;
                $scope.updateSessionView();
                $scope.redirect("/");
            };
        }]);
}());