/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardCtrl',
        ['$scope', 'BoardService', 'UserService', '$routeParams', 'ngDialog', function ($scope, BoardService, UserService, $routeParams, ngDialog) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
                    .then(function () {
                        $scope.redirectNonAuthenticated('/');
                    }, function () { // In case session promise fails
                        $scope.redirectNonAuthenticated('/');
                    });
            } else {
                $scope.redirectNonAuthenticated('/');
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

            UserService.getUsers()
                .success(function (data) {
                    $scope.allUsers = data;
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

            $scope.createCard = function () {
                var type;
                if ($scope.session && Underscore.contains($scope.session.roles, 'ProductOwner')) {
                    type = 'newFunctionality';
                }
                if ($scope.session && Underscore.contains($scope.session.roles, 'ScrumMaster')) {
                    type = 'silverBullet';
                }
                $scope.newCard = {
                    completion_date: null,
                    development_start_date: null,
                    is_active: true,
                    user: null,
                    type: type
                };
                ngDialog.openConfirm({
                    template: '/static/html/board/createEditCard.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                })
                    .then(function () {
                        console.log($scope.newCard);
                        /*if (type === 'newFunctionality') {
                            column = Underscore.filter($scope.allCols, function (col) {
                                return (col.is_high_priority === true && project);
                                }                        
                            });
                        }*/
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