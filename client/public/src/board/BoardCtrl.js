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

            BoardService.getBoard($routeParams.boardId)
                .success(function (data) {
                    $scope.board = data;
                });

            BoardService.getBoards()
                .success(function (data) {
                    $scope.boards = data;
                });

            $scope.createColumn = function () {
                $scope.newColumn = {};
                ngDialog.openConfirm({
                    template: '/static/html/board/createEditColumn.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                })
                    .then(function () {
                        $scope.newColumn.board = $routeParams.boardId;
                        $scope.newColumn.location = $scope.rootCols.length;
                        $scope.newColumn.parent_column = null;

                        console.log($scope.newColumn);
                        BoardService.createColumn($scope.newColumn)
                            .then(function () {
                                delete $scope.newColumn;
                            });
                    });
            };
        }]);
}());