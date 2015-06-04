/*global angular, console, Underscore, alert */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardCtrl',
        ['$scope', 'BoardService', 'UserService', '$routeParams', 'ngDialog', 'COL_DIM', 'ProjectService',
            function ($scope, BoardService, UserService, $routeParams, ngDialog, COL_DIM, ProjectService) {

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

                $scope.getProjects = function () {
                    ProjectService.getProjects()
                        .success(function (data) {
                            $scope.allProjects = data;
                            $scope.nullProjects = Underscore.filter(data, function (proj) {
                                return proj.board === null;
                            });
                        });
                };

                $scope.getBoardProjects = function (boardId) {
                    var tmp;
                    if (!$scope.allProjects) {
                        $scope.getProjects();
                    }

                    tmp = Underscore.filter($scope.allProjects, function (proj) {
                        return proj.board === boardId;
                    });
                    return (tmp === undefined) ? [] : tmp;
                };

                $scope.getProjects();

                BoardService.getBoard($routeParams.boardId)
                    .success(function (data) {
                        $scope.board = data;
                        $scope.board.projects = $scope.getBoardProjects($scope.board.id);
                    });

                BoardService.getBoards()
                    .success(function (data) {
                        $scope.boards = data;
                    });

                BoardService.getColumns($routeParams.boardId)
                    .success(function (data) {
                        $scope.allCols = data;
                        $scope.rootCols = $scope.getSubCols(null);
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
                    var highPriorityColumn, firstColumn;
                    $scope.type = '';
                    $scope.cardColumn = null;
                    highPriorityColumn = Underscore.where($scope.allCols, {'is_high_priority': true});
                    firstColumn = Underscore.sortBy($scope.allCols, function (x) { return x.location; });
                    //Alerts for non validate board
                    if (highPriorityColumn.length < 1) {
                        alert("Column with high priority is missing. Add one!");
                        return;
                    }
                    if ($scope.board.projects.length < 1) {
                        alert("There is no projects on the table. Add one!");
                        return;
                    }

                    if ($scope.session && Underscore.contains($scope.session.roles, 'ProductOwner')) {
                        $scope.type = 'newFunctionality';
                        $scope.cardColumn = firstColumn;
                    }
                    if ($scope.session && Underscore.contains($scope.session.roles, 'ScrumMaster')) {
                        $scope.type = 'silverBullet';
                        $scope.cardColumn = highPriorityColumn;
                    }

                    $scope.newCard = {
                        completion_date: null,
                        development_start_date: null,
                        is_active: true,
                        type: $scope.type,
                        column: $scope.cardColumn[0].id
                    };
                    ngDialog.openConfirm({
                        template: '/static/html/board/createEditCard.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            BoardService.createCard($scope.newCard)
                                .success(function (data) {
                                    console.log(data);
                                });
                            console.log($scope.newCard);
                        });
                };

                $scope.addProject = function () {
                    ngDialog.openConfirm({
                        template: '/static/html/board/addBoardProjects.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            $scope.addBoardProjects($scope.board);
                        });
                };

                $scope.addBoardProjects = function (board) {
                    var proj,
                        projects = angular.copy(board.projects),
                        i,
                        updateProjectSuccessFunction = function (data) {
                            $scope.board.projects.push(data);
                        };

                    $scope.board.projects = [];
                    // Update projects
                    for (i = 0; i < projects.length; i += 1) {
                        // Add board id to all projects
                        proj = projects[i];
                        proj.board = board.id;
                        ProjectService.updateProject(proj)
                            .success(updateProjectSuccessFunction);
                    }
                };

                $scope.getProjectsIfLeafColumn = function (colId, board) {
                    if ($scope.getSubCols(colId).length > 0) {
                        return board.projects.length > 0 ? [board.projects[0]] : [{ 'name': 'fake' }];
                    }
                    return board.projects;
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

                /*$scope.getMaxColDepth = function (cols) {
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
                };*/

                // Function return the kumulative width of given columns and while calculating it
                // sets the style settings for every column
                // When called with $scope.rootCols it will return board width
                $scope.getColsWidth = function (cols, depth) {
                    var kumWidth = 0,
                        i,
                        col,
                        subCols;

                    for (i = 0; i < cols.length; i += 1) {
                        col = cols[i];
                        subCols = $scope.getSubCols(col.id);

                        col.style = {
                            'width': $scope.getColsWidth(subCols, depth + 1),
                            'left': kumWidth,
                            'min-height': COL_DIM.height - (depth * COL_DIM.headerHeight) // Offset the column height according to column depth
                        };
                        kumWidth += col.style.width;
                    }

                    // This here we specify width for single column
                    return (kumWidth === 0) ? COL_DIM.width : kumWidth;
                };

            }]);
}());