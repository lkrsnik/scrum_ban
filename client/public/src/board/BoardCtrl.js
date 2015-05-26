/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardCtrl',
        ['$scope', 'BoardService', '$routeParams', 'ngDialog', function ($scope, BoardService, $routeParams, ngDialog) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
                    .then(function () {
                        $scope.redirectNonAdmin('/');
                        $scope.redirectNonAuthenticated('/');
                    }, function () { // In case session promise fails
                        $scope.redirectNonAdmin('/');
                        $scope.redirectNonAuthenticated('/');
                    });
            } else {
                $scope.redirectNonAuthenticated('/');
                $scope.redirectNonAdmin('/');
            }

            BoardService.getBoard($routeParams.boardId)
                .success(function (data) {
                    $scope.board = data;
                });

            BoardService.getBoards()
                .success(function (data) {
                    $scope.boards = data;
                });

            $scope.saveColumn = function (column) {
                if (column.mode.id) {
                    BoardService.updateColumn(column);
                } else {
                    BoardService.createColumn(column);
                }
            };

            $scope.createColumn = function () {
                ngDialog.openConfirm({
                    template: '/static/src/board/createColumn.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                })
                    .then(function () {
                        BoardService.createColumn($scope.column);
                    });
            };
        }]);
}());