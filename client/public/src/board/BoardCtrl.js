/*global angular, console, Underscore, alert */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardCtrl',
        ['$scope', 'BoardService', '$routeParams', 'ngDialog', 'COL_DIM', 'ProjectService', 'UserService',
            function ($scope, BoardService, $routeParams, ngDialog, COL_DIM, ProjectService, UserService) {

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

                $scope.COL_DIM = COL_DIM;
                $scope.rootCols = [];
                $scope.leafCols = [];
                $scope.allCols = [];
                $scope.columnCards = [];
                $scope.yourProjects = [];
                $scope.yourOwnedSMProjects = [];
                $scope.yourOwnedPOProjects = [];
                $scope.userOwnsProjects = false;
                $scope.isSM = false;
                $scope.isPO = false;
                $scope.violationDescription = "";
                $scope.silverBullet = false;
                $scope.board = {
                    projects: []
                };

                $scope.getProjects = function () {
                    $scope.promises.projectsPromise = ProjectService.getProjects()
                        .success(function (data) {
                            $scope.allProjects = data;
                            $scope.nullProjects = Underscore.filter(data, function (proj) {
                                return proj.board === null;
                            });
                        });
                };

                $scope.getBoardProjects = function (boardId) {
                    $scope.promises.projectsPromise
                        .then(function () {
                            var tmp = Underscore.filter($scope.allProjects, function (proj) {
                                return proj.board === boardId;
                            });
                            $scope.board.projects = (tmp === undefined) ? [] : tmp;
                        });
                };

                $scope.getColumnProjectCards = function (projectId, columnId) {
                    var cards;
                    cards = Underscore.where($scope.allCards, {'project': projectId, 'column': columnId});
                    cards.forEach(function (entry) {
                        if (entry.type === "silverBullet") {
                            entry.cardClass = "panel-danger";
                        } else if (entry.type === "newFunctionality") {
                            entry.cardClass = "panel-success";
                        } else if (entry.type === "rejected") {
                            entry.cardClass = "panel-warning";
                        }
                    });
                    return cards;
                };

                $scope.getProjects();

                BoardService.getBoard($routeParams.boardId)
                    .success(function (data) {
                        $scope.board = data;
                        $scope.getBoardProjects($scope.board.id);
                        ProjectService.getProjectbyBoardUser($scope.board.id)
                            .success(function (data) {
                                $scope.yourProjects = data;
                            });
                        ProjectService.getProjectbyBoardUserRole($scope.board.id, "ScrumMaster")
                            .success(function (data) {
                                data.yourRole = "ScrumMaster";
                                if (data.length > 0) {
                                    $scope.yourOwnedSMProjects.push(data);
                                    $scope.userOwnsProjects = true;
                                    $scope.isSM = true;
                                    $scope.yourOwnedSMProjects = Underscore.flatten($scope.yourOwnedSMProjects, true);
                                }
                            });
                        ProjectService.getProjectbyBoardUserRole($scope.board.id, "ProductOwner")
                            .success(function (data) {
                                data.yourRole = "ProductOwner";
                                if (data.length > 0) {
                                    $scope.yourOwnedPOProjects.push(data);
                                    $scope.userOwnsProjects = true;
                                    $scope.isPO = true;
                                    $scope.yourOwnedPOProjects = Underscore.flatten($scope.yourOwnedPOProjects, true);
                                    $scope.highPriorityColumn = Underscore.where($scope.allCols, {'is_high_priority': true});
                                    $scope.silverBullet = Underscore.where($scope.allCards, {'type': 'silverBullet', 'column': $scope.highPriorityColumn[0].id });
                                    console.log($scope.silverBullet);
                                    if ($scope.silverBullet.length > 0) {
                                        $scope.silverBullet = true;
                                    } else {
                                        $scope.silverBullet = false;
                                    }
                                }
                            });
                    });

                BoardService.getBoards()
                    .success(function (data) {
                        $scope.boards = data;
                    });

                BoardService.getColumns($routeParams.boardId)
                    .success(function (data) {
                        $scope.allCols = data;
                        $scope.updateCols();
                    });

                BoardService.getCards()
                    .success(function (data) {
                        $scope.allCards = data;
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
                    $scope.updateCols();
                };

                $scope.onProjectSelectionChange = function (type) {
                    $scope.showCreateCardForm = true;
                    if (type === 'ProductOwner') {
                        $scope.type = 'silverBullet';
                        $scope.cardColumn = $scope.firstColumn;
                    }
                    if (type === 'ScrumMaster') {
                        $scope.type = 'newFunctionality';
                        $scope.cardColumn = $scope.highPriorityColumn;
                    }
                };

                $scope.createCard = function () {
                    var move;
                    $scope.highPriorityColumn = Underscore.where($scope.allCols, {'is_high_priority': true});
                    $scope.silverBullet = Underscore.where($scope.allCards, {'type': 'silverBullet', 'column': $scope.highPriorityColumn[0].id });
                    if ($scope.silverBullet.length > 0) {
                        $scope.silverBullet = true;
                    } else {
                        $scope.silverBullet = false;
                    }
                    $scope.showCreateCardForm = false;
                    $scope.cardColumn = null;
                    $scope.highPriorityColumn = Underscore.where($scope.allCols, {'is_high_priority': true});
                    $scope.firstColumn = Underscore.sortBy($scope.allCols, function (x) { return x.location; });
                    //Alerts for non validate board
                    if ($scope.highPriorityColumn.length < 1) {
                        alert("Column with high priority is missing. Add one!");
                        return;
                    }
                    if ($scope.board.projects.length < 1) {
                        alert("There is no projects on the table. Add one!");
                        return;
                    }
                    $scope.newCard = {
                        completion_date: null,
                        development_start_date: null,
                        is_active: true
                    };
                    ngDialog.openConfirm({
                        template: '/static/html/board/createEditCard.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            $scope.newCard.project = $scope.newCard.project.id;
                            $scope.newCard.column = $scope.cardColumn[0].id;
                            $scope.newCard.type = $scope.type;
                            BoardService.createCard($scope.newCard)
                                .success(function (data) {
                                    console.log(data);
                                    $scope.allCards.push(data);
                                    move = {
                                        card: data.id,
                                        user: $scope.session.userid,
                                        from_position: null
                                    };
                                    BoardService.createMove(move);
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
                    $scope.allCols.push(col);
                    $scope.updateCols();
                };

                $scope.updateCols = function () {
                    $scope.allCols = Underscore.sortBy($scope.allCols, 'location');
                    $scope.rootCols = $scope.getSubCols(null);
                    // Set leaf columns values
                    $scope.getColsWidth($scope.rootCols, 0);
                    $scope.leafCols = Underscore.sortBy(Underscore.filter($scope.allCols, function (c) {
                        return c.isLeafCol;
                    }), 'location');
                };

                $scope.calculateColLocation = function (col) {
                    var leftCol,
                        rightCol,
                        parentCol;
                    // First column ever
                    if ($scope.allCols.length === 0) {
                        return 100;
                    }
                    // First sub column
                    if (col.left === undefined && col.right === undefined && col.parent_column !== null) {
                        parentCol = Underscore.findWhere($scope.allCols, { 'id': col.parent_column });
                        col.left = $scope.getLeftLeafCol(parentCol);
                        col.right = $scope.getRightLeafCol(parentCol);

                        return $scope.calculateColLocation(col);
                    }
                    // Most right column between siblings - search for right leaf col
                    if (col.right === undefined) {
                        rightCol = $scope.getRightLeafCol(col.left);
                        if (rightCol) {
                            return (col.left.location + rightCol.location) / 2;
                        }
                        // Most right column between leaf cols
                        return col.left.location + 1;
                    }
                    // Most left column between siblings - search for left leaf col
                    if (col.left === undefined) {
                        leftCol = $scope.getLeftLeafCol(col.right);
                        if (leftCol) {
                            return (leftCol.location + col.right.location) / 2;
                        }
                        // Most left column between leaf cols
                        return col.right.location - 1;
                    }
                    return (col.left.location + col.right.location) / 2;
                };

                $scope.getLeftCols = function (col, cols) {
                    var result = Underscore.filter(cols, function (c) {
                        return c.location < col.location;
                    });
                    return Underscore.sortBy(result, 'location');
                };
                $scope.getLeftLeafCol = function (col) {
                    var leftCols = $scope.getLeftCols(col, $scope.leafCols);
                    return leftCols.pop(); // Returns last element and returns undefined if array is empty
                };
                $scope.getLeftSyblingCols = function (col) {
                    return $scope.getLeftCols(col, $scope.getSubCols(col.parent_column));
                };

                $scope.getRightCols = function (col, cols) {
                    var result = Underscore.filter(cols, function (c) {
                        return c.location > col.location;
                    });
                    return Underscore.sortBy(result, 'location');
                };
                $scope.getRightLeafCol = function (col) {
                    var rightCols = $scope.getRightCols(col, $scope.leafCols);
                    return rightCols.shift(); // Returns first element and returns undefined if array is empty
                };
                $scope.getRightSyblingCols = function (col) {
                    return $scope.getRightCols(col, $scope.getSubCols(col.parent_column));
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
                        subCols,
                        numProjects = $scope.board.projects ? $scope.board.projects.length : 1;

                    numProjects = (numProjects < 1) ? 1 : numProjects;

                    for (i = 0; i < cols.length; i += 1) {
                        col = cols[i];
                        subCols = $scope.getSubCols(col.id);

                        col.style = {
                            'width': $scope.getColsWidth(subCols, depth + 1),
                            'left': kumWidth,
                            'min-height': (numProjects * COL_DIM.height) - (depth * (COL_DIM.headerHeight + 2)) // Offset the column height according to column depth
                        };

                        col.isLeafCol = subCols.length === 0; // If it has the same width as basic column it's a leaf column
                        kumWidth += col.style.width;
                    }

                    // This here we specify width for single column
                    return (kumWidth === 0) ? COL_DIM.width : kumWidth;
                };

                $scope.getBoardStyle = function () {
                    var boardWidth = $scope.getColsWidth($scope.rootCols, 0) + 'px',
                        boardHeight = ($scope.rootCols.length > 0 ? $scope.rootCols[0].style['min-height'] : COL_DIM.height) + 20 + 'px';

                    return {
                        'width': boardWidth,
                        'margin-bottom': boardHeight
                    };
                };

                $scope.getProjectStyle = function (col, isFirst, isLast) {
                    var projStyle = {
                        'min-height': COL_DIM.height
                    },
                        numProjects = $scope.board.projects ? $scope.board.projects.length : 1;
                    if (isFirst) {
                        projStyle['min-height'] = col.style['min-height'] - ((numProjects - 1) * COL_DIM.height);
                    }
                    if (isLast) {
                        projStyle['min-height'] -= 42;
                        projStyle['border-bottom'] = 'none';
                    }

                    return projStyle;
                };

                //$scope.obj = "test";
                var eachProduct = [
                    {
                        "name": "ime1"
                    }, {
                        "name": "ime2"
                    }, {
                        "name": "ime3"
                    }];
                $scope.draggableObjects = eachProduct;
                $scope.wasDragged = [{
                    "name": "ime5"
                }];

                $scope.countCards = function (column) {
                    if (column.isLeafCol) {
                        return Underscore.where($scope.allCards, {'column': column.id}).length;
                    }
                    var cols = Underscore.where($scope.allCols, {'parent_column': column.id}),
                        i,
                        sum = 0;
                    for (i = 0; i < cols.length; i += 1) {
                        sum += $scope.countCards(cols[i]);
                    }
                    return sum;
                };

                $scope.onDropComplete = function (data, proj, col) {

                    $scope.countCards(data);
                    var right = $scope.getRightLeafCol(col),
                        left = $scope.getLeftLeafCol(col),
                        move,
                        prevCol = Underscore.where($scope.allCols, {'id': data.column})[0],
                        highestPriorityCol = Underscore.where($scope.allCols, {'is_high_priority': true})[0],
                        colsLeftOfHighPriColumn = $scope.getLeftCols(highestPriorityCol, $scope.leafCols);

                    // when card is not moved one place right, one left or on the same column
                    // and when card isn't moved from acceptance test column to one before or on high priority column
                    if (!((right && right.id === data.column) || (left && left.id === data.column) || (col.id === data.column)) &&
                            !(prevCol.acceptance_test && (highestPriorityCol === col || Underscore.contains(colsLeftOfHighPriColumn, col)) && $scope.isPO)) {
                        move = {
                            card: data.id,
                            user: $scope.session.userid,
                            from_position: data.column,
                            to_position: col.id,
                            is_legal: false
                        };
                        BoardService.createMove(move);
                        return;
                    }
                    move = {
                        card: data.id,
                        user: $scope.session.userid,
                        from_position: data.column,
                        to_position: col.id
                    };
                    if (highestPriorityCol === col || Underscore.contains(colsLeftOfHighPriColumn, col)) {
                        if (data.type !== 'silverBullet') {
                            data.type = 'rejected';
                        }
                    }
                    data.project = proj.id;
                    data.column = col.id;
                    BoardService.createMove(move);
                    BoardService.updateCard(data);
                };
            }]);
}());