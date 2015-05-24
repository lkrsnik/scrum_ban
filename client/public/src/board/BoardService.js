/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('BoardService',
        ['$http', 'API_URL', function ($http, API_URL) {

            return {
                createBoard: function (board) {
                    return $http.post(API_URL + 'boards/', board);
                }
            };
        }]);
}());