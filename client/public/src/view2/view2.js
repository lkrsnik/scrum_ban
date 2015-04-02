/*global angular */
(function () {
    'use strict';
    angular.module('myApp.view2', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/static/view2', {
            templateUrl: 'static/html/view2/view2.html',
            controller: 'View2Ctrl'
        });
    }]).controller('View2Ctrl', [function () {
        return;
    }]);
}());