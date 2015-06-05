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
                },
                deleteColumn: function (columnId) {
                    return $http.delete(API_URL + 'columns/' + columnId + '/');
                },
                getColumns: function (boardId) {
                    return $http.get(API_URL + 'columns/', {
                        params: { boardId: boardId }
                    });
                },
                createCard: function (card) {
                    return $http.post(API_URL + 'cards/', card);
                },
                updateCard: function (card) {
                    return $http.put(API_URL + 'cards/' + card.id + '/', card);
                },
                getCards: function () {
                    return $http.get(API_URL + 'cards/');
                },
                createMove: function (move) {
                    return $http.post(API_URL + 'moves/', move);
                }
                /*,
                getBoard: function (boardId) {
                    return $http.get(API_URL + 'boards/' + boardId + '/');
                },*/
            };
        }]);
}());