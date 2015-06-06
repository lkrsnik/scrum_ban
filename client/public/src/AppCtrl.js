/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('AppCtrl',
        ['$scope', '$q', 'Session', '$location', '$localStorage', 'ngDialog', 'DOCS', function ($scope, $q, Session, $location, $localStorage, ngDialog, DOCS) {
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
                if ($scope.session && !$scope.session.is_staff) {
                    //console.log('Nimate ustreznih pooblastil za ogled te strani.');
                    $scope.redirect(link);
                }
            };

            $scope.redirectNonScrumMaster = function (link) {
                if ($scope.session && !Underscore.contains($scope.session.roles, 'ScrumMaster') && !$scope.session.is_staff) {
                    //console.log('Nimate ustreznih pooblastil za ogled te strani.');
                    $location.path(link);
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

            $scope.getDocs = function () {
                $scope.DOCS = DOCS;
                ngDialog.openConfirm({
                    template: '/static/html/wireframe/documentation.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                });
            };
        }]);
}());