/*global angular, console */
(function () {
    'use strict';
    angular.module('scrumBan').factory('BoardService',
        ['$http', 'API_URL', function ($http, API_URL) {

            return {
                createBoard: function (board) {
                    return $http.post(API_URL + 'boards/', board);
                },
                getBoard: function (boardId) {
                    return $http.get(API_URL + 'boards/' + boardId + '/');
                },
                getBoards: function () {
                    return $http.get(API_URL + 'boards/');
                },
                createColumn: function (column) {
                    return $http.post(API_URL + 'columns/', column);
                }/*,
                getBoard: function (boardId) {
                    return $http.get(API_URL + 'boards/' + boardId + '/');
                },
                getBoards: function () {
                    return $http.get(API_URL + 'boards/');
                }*/
            };
        }]);
}());