/*global angular, console */
(function () {
    'use strict';
    angular.module('myApp.view1', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'static/html/view1/view1.html',
            controller: 'View1Ctrl'
        });
    }]).controller('View1Ctrl', ['$scope', 'Service', function ($scope, Service) {
        $scope.success = "blablablabla";
        Service.getTest().success(function (data) {
            $scope.success = data.username;
        });
        return;
    }]);
    angular.module('myApp').factory('Service', ['$http', function ($http) {
        return {
            getTest: function () {
                return $http.get('http://127.0.0.1:8000/api/users/1/');
            }
        };
    }]);
}());