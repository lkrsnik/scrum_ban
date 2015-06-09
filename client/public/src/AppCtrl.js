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
                    $scope.redirect(link);
                }
            };

            $scope.redirectNonScrumMaster = function (link) {
                if ($scope.session && !$scope.session.is_scrum_master && !$scope.session.is_staff) {
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

            $scope.getDocs = function () {
                $scope.DOCS = DOCS;
                ngDialog.openConfirm({
                    template: '/static/html/wireframe/documentation.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                });
            };

            $scope.notify = function (type, content, feedback) {
                $scope.notification = {
                    panelClass: 'panel-default',
                    type: '',
                    content: ''
                };
                switch (type) {
                case ('Warning'):
                    $scope.notification.panelClass = 'panel-warning';
                    break;
                case ('Error'):
                    $scope.notification.panelClass = 'panel-danger';
                    break;
                case ('Success'):
                    $scope.notification.panelClass = 'panel-success';
                    break;
                case ('Information'):
                    $scope.notification.panelClass = 'panel-info';
                    break;
                }
                if (feedback) {
                    $scope.notification.feedback = true;
                } else {
                    $scope.notification.feedback = false;
                }
                $scope.notification.type = type;
                $scope.notification.content = content;
                return ngDialog.openConfirm({
                    template: '/static/html/utils/notification.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                });
            };

            $scope.filterStaff = function (value) {
                return value.is_staff && $scope.session.is_staff;
            };

            $scope.filterRoles = function (value) {
                // If roles are undefined on a value and is not for staff,
                // then value is accessible to all roles,
                // otherwise filter them regarding session.roles
                return (!value.roles && !value.is_staff) || Underscore.intersection($scope.session.roles, value.roles).length > 0;
            };

            $scope.filterStaffAndRoles = function (value) {
                return ($scope.filterRoles(value) || $scope.filterStaff(value));
            };
        }]);
}());