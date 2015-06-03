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

            BoardService.getColumns($routeParams.boardId)
                .success(function (data) {
                    console.log(data);
                    $scope.allCols = data;
                    $scope.rootCols = $scope.getSubCols(null);
                    $scope.maxColDepth = $scope.getMaxColDepth($scope.rootCols);
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
                        $scope.newColumn.location = $scope.calculateColLocation($scope.newColumn);
                        delete $scope.newColumn.left;
                        delete $scope.newColumn.right;

                        console.log($scope.newColumn);
                        BoardService.createColumn($scope.newColumn)
                            .success(function (data) {
                                $scope.proccessSavedColumn(data);
                            });
                    });
            };

            $scope.deleteColumn = function (column) {
                BoardService.deleteColumn(column.id);

                $scope.allCols = Underscore.without($scope.allCols, column);
                $scope.rootCols = $scope.getSubCols(null);
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

            $scope.proccessSavedColumn = function (col) {
                if (col.parent_column === null) {
                    $scope.rootCols.push(col);
                }
                $scope.allCols.push(col);
            };

            $scope.calculateColLocation = function (col) {
                var tmpCols;
                if (col.left === undefined && col.right === undefined) {
                    return 100;
                }
                if (col.right === undefined) {
                    tmpCols = $scope.getSubColsRightOf(col.parent_column, col.left);
                    if (tmpCols && tmpCols.length > 0) {
                        return (col.left + tmpCols[0].location) / 2;
                    }
                    return col.left + 1;
                }
                if (col.left === undefined) {
                    tmpCols = $scope.getSubColsLeftOf(col.parent_column, col.right);
                    if (tmpCols && tmpCols.length > 0) {
                        return (col.right + tmpCols[0].location) / 2;
                    }
                    return col.right - 1;
                }
                return (col.left + col.right) / 2;
            };

            $scope.getSubColsLeftOf = function (parentColId, rightColLocation) {
                var result = Underscore.filter($scope.allCols, function (col) {
                    return col.parent_column === parentColId && (rightColLocation === null || col.location < rightColLocation);
                });
                return Underscore.sortBy(result, 'location');
            };

            $scope.getSubColsRightOf = function (parentColId, leftColLocation) {
                var result = Underscore.filter($scope.allCols, function (col) {
                    return col.parent_column === parentColId && (leftColLocation === null || col.location > leftColLocation);
                });
                return Underscore.sortBy(result, 'location');
            };

            $scope.getSubCols = function (parentColId) {
                var result = Underscore.filter($scope.allCols, function (col) {
                    return col.parent_column === parentColId;
                });
                return Underscore.sortBy(result, 'location');
            };

            $scope.getMaxColDepth = function (cols) {
                var maxDepth = 0,
                    tmp,
                    i;
                for (i = 0; i < cols.length; i += 1) {
                    tmp = 1 + $scope.getMaxColDepth($scope.getSubCols(cols[i].id));
                    if (tmp > maxDepth) {
                        maxDepth = tmp;
                    }
                }
                return maxDepth;
            };

            $scope.getMaxSubColsLen = function (cols) {
                var maxSubColsLen = cols.length,
                    tmp,
                    i;
                for (i = 0; i < cols.length; i += 1) {
                    tmp = $scope.getMaxSubColsLen($scope.getSubCols(cols[i].id));
                    if (tmp > maxSubColsLen) {
                        maxSubColsLen = tmp;
                    }
                }
                return maxSubColsLen;
            };

            $scope.getSubColsWidth = function (cols, depth) {
                var kumWidth = 0,
                    i,
                    col,
                    subCols;

                for (i = 0; i < cols.length; i += 1) {
                    col = cols[i];
                    subCols = $scope.getSubCols(col.id);

                    col.style = {
                        'width': $scope.getSubColsWidth(subCols, depth + 1),
                        'left': kumWidth,
                        'min-height': 800 - (depth * 40)
                    };
                    kumWidth += col.style.width;
                }

                return (kumWidth === 0) ? 200 : kumWidth;
            };

        }]);
}());