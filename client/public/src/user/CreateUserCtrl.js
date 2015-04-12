/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateUserCtrl', ['$scope', function ($scope) {

        $scope.createUser = function (user) {
            console.log('Creating user:');
            console.log(user);
        };
    }]);
}());