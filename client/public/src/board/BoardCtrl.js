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

            $scope.rootCols = [];
            $scope.allCols = [];

            BoardService.getBoard($routeParams.boardId)
                .success(function (data) {
                    $scope.board = data;
                });

            BoardService.getBoards()
                .success(function (data) {
                    $scope.boards = data;
                });

            BoardService.getColumns()
                .success(function (data) {
                    $scope.allCols = data;
                    $scope.rootCols = Underscore.filter(data, function (col) {
                        return col.parent_column === null;
                    });
                });

            $scope.createColumn = function () {
                $scope.newColumn = {
                    parent_column: null
                };
                ngDialog.openConfirm({
                    template: '/static/html/board/createEditColumn.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                })
                    .then(function () {
                        $scope.newColumn.board = $routeParams.boardId;
                        $scope.newColumn.location = $scope.rootCols.length;

                        console.log($scope.newColumn);
                        BoardService.createColumn($scope.newColumn)
                            .then(function () {
                                $scope.proccessSavedColumn($scope.newColumn);
                            });
                    });
            };

            $scope.proccessSavedColumn = function (column) {
                if (column.parent_column === null) {
                    $scope.rootCols.push(column);
                }
                $scope.allCols.push(column);
            };

            $scope.getSubCols = function (parentColId) {
                return Underscore.filter($scope.allCols, function (col) {
                    return col.parent_column === parentColId;
                });
            };
        }]);
}());