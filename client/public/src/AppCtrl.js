/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('AppCtrl',
        ['$scope', '$q', 'Session', function ($scope, $q, Session) {
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
                            $scope.session = undefined;
                        });
                }
            };
        }]);
}());