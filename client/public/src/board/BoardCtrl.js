/*global angular, console, Underscore, alert */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardCtrl',
        ['$scope', 'BoardService', '$routeParams', 'ngDialog', 'COL_DIM', 'ProjectService', 'UserService', '$location',
            function ($scope, BoardService, $routeParams, ngDialog, COL_DIM, ProjectService, UserService, $location) {

                //////////////////////////////////////// INIT ////////////////////////////////////////

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

                // Board init
                $scope.board = {
                    projects: []
                };

                // Columns init
                $scope.COL_DIM = COL_DIM;
                $scope.rootCols = [];
                $scope.leafCols = [];
                $scope.allCols = [];
                $scope.specialCols = {
                    'borderCols': [],
                    'acceptanceTestCol': null,
                    'highPriorityCol': null
                };

                // Projects init
                $scope.yourBoardProjects = [];
                $scope.yourNullProjects = [];
                $scope.yourProjects = [];
                $scope.yourOwnedSMProjects = [];
                $scope.yourOwnedPOProjects = [];
                $scope.userOwnsProjects = false;
                $scope.isSM = false;
                $scope.isPO = false;

                // Cards init
                $scope.columnCards = [];
                $scope.violationDescription = "";
                $scope.silverBullet = false;
                $scope.WIPErr = false;
                $scope.allCards = [];

                // Redirect init
                $scope.go = function (path) {
                    $location.path($location.path() + path);
                };


                //////////////////////////////////////// BOARD /////////////////////////////////////////

                $scope.promises.boardPromise = BoardService.getBoard($routeParams.boardId)
                    .success(function (data) {
                        $scope.board = data;
                    });

                $scope.getBoardStyle = function () {
                    var boardWidth = $scope.getColsWidth($scope.rootCols, 0) + 'px',
                        boardHeight = ($scope.rootCols.length > 0 ? $scope.rootCols[0].style['min-height'] : COL_DIM.height) + 20 + 'px';

                    return {
                        'width': boardWidth,
                        'margin-bottom': boardHeight
                    };
                };

                //////////////////////////////////////// COLUMNS /////////////////////////////////////////

                BoardService.getColumns($routeParams.boardId)
                    .success(function (data) {
                        $scope.allCols = data;
                        $scope.updateCols();
                    });

                $scope.createColumn = function () {
                    $scope.newCol = {
                        parent_column: null
                    };
                    ngDialog.openConfirm({
                        template: '/static/html/board/createEditColumn.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            $scope.newCol.board = $routeParams.boardId;
                            $scope.newCol.location = $scope.calculateColLocation($scope.newCol);
                            delete $scope.newCol.left;
                            delete $scope.newCol.right;

                            BoardService.createColumn($scope.newCol)
                                .success(function (data) {
                                    $scope.proccessSavedColumn(data);
                                });
                        });
                };

                $scope.editColumn = function (oldCol) {
                    $scope.newCol = angular.copy(oldCol);
                    ngDialog.openConfirm({
                        template: '/static/html/board/createEditColumn.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            $scope.newCol.board = $routeParams.boardId;

                            BoardService.updateColumn($scope.newCol)
                                .success(function () {
                                    if (oldCol.location !== $scope.newCol.location) {
                                        $scope.deleteSubColsLocations($scope.newCol);
                                        $scope.recalculateSubColsLocations($scope.newCol);
                                    }

                                    $scope.allCols = Underscore.without($scope.allCols, oldCol);
                                    $scope.proccessSavedColumn($scope.newCol);
                                });
                        });
                };

                $scope.deleteColumn = function (col) {
                    BoardService.deleteColumn(col.id);

                    $scope.allCols = Underscore.without($scope.allCols, col);
                    $scope.updateCols();
                };

                $scope.proccessSavedColumn = function (col) {
                    var parentCol = Underscore.findWhere($scope.allCols, { 'id': col.parent_column });

                    if (parentCol && parentCol.is_border) {
                        // If yes change the child column to be border column
                        parentCol.is_border = false;
                        BoardService.updateColumn(parentCol);
                        col.is_border = true;
                        BoardService.updateColumn(col);
                    }

                    if (parentCol && parentCol.acceptance_test) {
                        parentCol.acceptance_test = false;
                        BoardService.updateColumn(parentCol);
                        col.acceptance_test = true;
                        BoardService.updateColumn(col);
                    }

                    $scope.allCols.push(col);
                    $scope.updateCols();
                };

                $scope.updateCols = function () {
                    $scope.specialCols.borderCols = Underscore.sortBy(Underscore.where($scope.allCols, { 'is_border': true }), 'location');
                    $scope.specialCols.acceptanceTestCol = Underscore.findWhere($scope.allCols, { 'acceptance_test': true });

                    $scope.allCols = Underscore.sortBy($scope.allCols, 'location');
                    $scope.rootCols = $scope.getSubCols(null);
                    // Set leaf columns values
                    $scope.getColsWidth($scope.rootCols, 0);
                    $scope.leafCols = Underscore.sortBy(Underscore.filter($scope.allCols, function (c) {
                        return c.isLeafCol;
                    }), 'location');
                    $scope.updateHighPriorityCol();
                };

                $scope.updateHighPriorityCol = function () {
                    var oldHighPriorityCol = angular.copy($scope.specialCols.highPriorityCol);
                    if ($scope.specialCols.borderCols.length > 0) {
                        $scope.specialCols.highPriorityCol = $scope.getLeftLeafCol($scope.specialCols.borderCols[0]);
                        if ($scope.specialCols.highPriorityCol) {
                            $scope.specialCols.highPriorityCol.is_high_priority = true;
                            BoardService.updateColumn($scope.specialCols.highPriorityCol);
                        }
                    } else {
                        $scope.specialCols.highPriorityCol = null;
                    }

                    // If high priority column changed reset old high priority column
                    if (oldHighPriorityCol && ((!$scope.specialCols.highPriorityCol) || (oldHighPriorityCol.id !== $scope.specialCols.highPriorityCol.id))) {
                        oldHighPriorityCol.is_high_priority = false;
                        BoardService.updateColumn(oldHighPriorityCol);
                    }
                };

                $scope.recalculateSubColsLocations = function (col) {
                    var subCol,
                        subCols = $scope.getSubCols(col.id),
                        i;

                    // We expect left to be set here
                    if (!col.left) {
                        console.log("left not set error");
                    }

                    col.location = $scope.calculateColLocation(col);
                    BoardService.updateColumn(col);

                    for (i = 0; i < subCols.length; i += 1) {
                        subCol = subCols[i];

                        if (i === 0) {
                            // First sub col
                            subCol.left = $scope.getLeftLeafCol(col);
                        } else {
                            subCol.left = subCols[i - 1];
                        }

                        $scope.recalculateSubColsLocations(subCol);
                    }


                    // Get subcolumns a
                };

                $scope.deleteSubColsLocations = function (col) {
                    var subCol,
                        subCols = $scope.getSubCols(col.id),
                        i;
                    delete col.location;

                    for (i = 0; i < subCols.length; i += 1) {
                        subCol = subCols[i];
                        $scope.deleteSubColsLocations(subCol);
                    }
                };

                $scope.calculateColLocation = function (col) {
                    var leftCol,
                        rightCol,
                        parentCol;
                    // First column ever
                    if ($scope.allCols.length === 0) {
                        return 1000;
                    }
                    // Edit column, no changes regarding with location were made
                    if ((col.left === undefined || col.left === null) && (col.right === undefined || col.right === null) && col.location) {
                        return col.location;
                    }

                    // First sub column
                    if ((col.left === undefined || col.left === null) && (col.right === undefined || col.right === null) && col.parent_column !== null) {
                        parentCol = Underscore.findWhere($scope.allCols, { 'id': col.parent_column });
                        col.left = $scope.getLeftLeafCol(parentCol);
                        col.right = $scope.getRightLeafCol(parentCol);

                        return $scope.calculateColLocation(col);
                    }
                    // Most right column between siblings - search for right leaf col
                    if ((col.right === undefined || col.right === null)) {
                        // Check if left column has sub columns
                        if (!col.left.isLeafCol) {
                            // If it does, get his right most sub-leaf column
                            col.left = $scope.getSubLeafCols(col.left).pop();
                        }

                        rightCol = $scope.getRightLeafCol(col.left);
                        if (rightCol) {
                            return (col.left.location + rightCol.location) / 2;
                        }
                        // Most right column between leaf cols
                        return col.left.location + 100;
                    }
                    // Most left column between siblings - search for left leaf col
                    if ((col.left === undefined || col.left === null)) {
                        // Check if right column has sub columns
                        if (!col.right.isLeafCol) {
                            // If it does, get his left most sub-leaf column
                            col.right = $scope.getSubLeafCols(col.right).shift();
                        }
                        leftCol = $scope.getLeftLeafCol(col.right);
                        if (leftCol) {
                            return (leftCol.location + col.right.location) / 2;
                        }
                        // Most left column between leaf cols
                        return col.right.location - 100;
                    }
                    // Both left and right are defined
                    // Check if left column has sub columns
                    if (!col.left.isLeafCol) {
                        // If it does, get his right most sub-leaf column
                        col.left = $scope.getSubLeafCols(col.left).pop();
                    }
                    // Check if right column has sub columns
                    if (!col.right.isLeafCol) {
                        // If it does, get his left most sub-leaf column
                        col.right = $scope.getSubLeafCols(col.right).shift();
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

                $scope.getSubLeafCols = function (col) {
                    var result = [],
                        subCols,
                        subCol,
                        i;

                    if (col.isLeafCol) {
                        return [col];
                    }

                    subCols = $scope.getSubCols(col.id);

                    for (i = 0; i < subCols.length; i += 1) {
                        subCol = subCols[i];
                        result = result.concat($scope.getSubLeafCols(subCol));
                    }

                    return Underscore.sortBy(result, 'location');
                };

                // Function return the kumulative width of given columns and while calculating it
                // sets the style settings for every column
                // When called with $scope.rootCols it will return board width
                $scope.getColsWidth = function (cols, depth) {
                    var kumWidth = 0,
                        i,
                        col,
                        subCols,
                        numProjects = $scope.yourBoardProjects ? $scope.yourBoardProjects.length : 1;

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
                        col.depth = depth;
                        kumWidth += col.style.width;
                    }

                    // This here we specify width for single column
                    return (kumWidth === 0) ? COL_DIM.width : kumWidth;
                };



                //////////////////////////////////////// PROJECTS ////////////////////////////////////////

                $scope.getProjects = function () {
                    $scope.promises.projectsPromise = ProjectService.getProjects()
                        .success(function (data) {
                            $scope.allProjects = data;
                            $scope.nullProjects = Underscore.filter(data, function (proj) {
                                return proj.board === null;
                            });
                        });
                };
                $scope.getProjects();

                /*$scope.getBoardProjects = function (boardId) {
                    $scope.promises.projectsPromise
                        .then(function () {
                            var tmp = Underscore.filter($scope.allProjects, function (proj) {
                                return proj.board === boardId;
                            });
                            $scope.board.projects = (tmp === undefined) ? [] : tmp;
                        });
                };*/

                $scope.promises.boardPromise
                    .then(function () {
                        //$scope.getBoardProjects($scope.board.id);
                        ProjectService.getProjectsByUser()
                            .success(function (data) {
                                $scope.yourProjects = data;
                                $scope.yourNullProjects = Underscore.where(data, { 'board': null });
                            });
                        ProjectService.getProjectbyBoardUser($scope.board.id)
                            .success(function (data) {
                                $scope.yourBoardProjects = data;
                                $scope.yourBoardProjects = Underscore.sortBy(data, 'id');
                            });
                        $scope.updateOwnedProjects();
                    });
                $scope.updateOwnedProjects = function () {
                    $scope.userOwnsProjects = false;
                    $scope.isSM = false;
                    $scope.isPO = false;
                    ProjectService.getProjectbyBoardUserRole($scope.board.id, "ScrumMaster")
                        .success(function (data) {
                            $scope.yourOwnedSMProjects = Underscore.map(data, function (proj) {
                                proj.yourRole = "ScrumMaster";
                                return proj;
                            });
                            if (data.length > 0) {
                                $scope.userOwnsProjects = true;
                                $scope.isSM = true;
                            }
                        });
                    ProjectService.getProjectbyBoardUserRole($scope.board.id, "ProductOwner")
                        .success(function (data) {
                            $scope.yourOwnedPOProjects = Underscore.map(data, function (proj) {
                                proj.yourRole = "ProductOwner";
                                return proj;
                            });
                            if (data.length > 0) {
                                $scope.userOwnsProjects = true;
                                $scope.isPO = true;
                                if ($scope.specialCols.highPriorityCol) {
                                    $scope.silverBullet = Underscore.where($scope.allCards, {'type': 'silverBullet', 'column': $scope.specialCols.highPriorityCol.id });
                                    $scope.silverBullet = $scope.silverBullet.length > 0;
                                }
                            }
                        });
                };

                $scope.editBoardProjects = function () {
                    $scope.editedProjects = {
                        'removed': [],
                        'added': []
                    };
                    $scope.projectsToRemove = Underscore.filter($scope.yourBoardProjects, function (proj) {
                        return Underscore.where($scope.allCards, { 'project': proj.id }).length === 0;
                    });
                    ngDialog.openConfirm({
                        template: '/static/html/board/editBoardProjects.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            $scope.addProjectsToBoard($scope.editedProjects.added);
                            $scope.removeProjectsFromBoard($scope.editedProjects.removed);

                            $scope.promises.editBoardProjectsPromise
                                .then(function () {
                                    $scope.updateOwnedProjects();
                                });
                        });
                };

                $scope.removeProjectsFromBoard = function (projects) {
                    var proj,
                        i;
                    for (i = 0; i < projects.length; i += 1) {
                        proj = projects[i];
                        proj.board = null;

                        $scope.yourBoardProjects = Underscore.without($scope.yourBoardProjects, proj);
                        $scope.yourNullProjects.push(proj);

                        $scope.promises.editBoardProjectsPromise = ProjectService.updateProject(proj);
                    }
                    $scope.yourNullProjects = Underscore.sortBy($scope.yourNullProjects, 'id');
                };

                $scope.addProjectsToBoard = function (projects) {
                    var proj,
                        i;
                    for (i = 0; i < projects.length; i += 1) {
                        proj = projects[i];
                        proj.board = $scope.board.id;

                        $scope.yourNullProjects = Underscore.without($scope.yourNullProjects, proj);
                        $scope.yourBoardProjects.push(proj);

                        $scope.promises.editBoardProjectsPromise = ProjectService.updateProject(proj);
                    }
                    $scope.yourBoardProjects = Underscore.sortBy($scope.yourBoardProjects, 'id');
                };

                /*$scope.editBoardProjects = function (board) {
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
                };*/

                $scope.getProjectStyle = function (col, isFirst, isLast) {
                    var projStyle = {
                        'min-height': COL_DIM.height
                    },
                        numProjects = $scope.yourBoardProjects ? $scope.yourBoardProjects.length : 1;
                    if (isFirst) {
                        projStyle['min-height'] = col.style['min-height'] - ((numProjects - 1) * COL_DIM.height);
                    }
                    if (isLast) {
                        projStyle['min-height'] -= 42;
                        projStyle['border-bottom'] = 'none';
                    }

                    return projStyle;
                };

                //////////////////////////////////////// CARDS ///////////////////////////////////////////

                BoardService.getCards()
                    .success(function (data) {
                        $scope.allCards = data;
                    });

                UserService.getUsers()
                    .success(function (data) {
                        $scope.allUsers = data;
                    });

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

                $scope.onProjectSelectionChange = function (type) {
                    $scope.showCreateCardForm = true;
                    if (type === 'ProductOwner') {
                        $scope.type = 'silverBullet';
                        $scope.cardColumn = $scope.specialCols.highPriorityCol;
                    }
                    if (type === 'ScrumMaster') {
                        $scope.type = 'newFunctionality';
                        $scope.cardColumn = $scope.firstColumn[0];
                    }
                    if ($scope.wipError($scope.cardColumn)) {
                        $scope.WIPErr = true;
                        $scope.notify('Warning', 'You have exceeded WIP limit!');
                    }
                };

                $scope.createCard = function () {
                    var move;
                    if ($scope.specialCols.highPriorityCol) {
                        $scope.silverBullet = Underscore.where($scope.allCards, {'type': 'silverBullet', 'column': $scope.specialCols.highPriorityCol.id });
                        $scope.silverBullet = $scope.silverBullet.length > 0;
                    }
                    $scope.showCreateCardForm = false;
                    $scope.cardColumn = null;
                    $scope.firstColumn = Underscore.sortBy($scope.allCols, function (x) { return x.location; });
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
                            $scope.newCard.column = $scope.cardColumn.id;
                            $scope.newCard.type = $scope.type;
                            BoardService.createCard($scope.newCard)
                                .success(function (data) {
                                    $scope.allCards.push(data);
                                    move = {
                                        card: data.id,
                                        user: $scope.session.userid,
                                        from_position: null,
                                        is_legal: !$scope.WIPErr,
                                        to_position: $scope.newCard.column
                                    };
                                    $scope.WIPErr = false;
                                    BoardService.createMove(move);
                                });
                        });
                };

                $scope.editCard = function (card) {
                    console.log(card);
                    $scope.card = card;
                    ngDialog.openConfirm({
                        template: '/static/html/board/editCard.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            BoardService.updateCard($scope.card)
                                .success(function () {
                                    console.log("YEEAAAA");
                                });
                        });
                };

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

                $scope.wipError = function (column) {
                    if ($scope.countCards(column) >= column.wip) {
                        return true;
                    }
                    if (!column.parent_column) {
                        return false;
                    }
                    var parentColumn = Underscore.findWhere($scope.allCols, {'id': column.parent_column})[0];
                    if (parentColumn) {
                        return $scope.wipError(parentColumn);
                    }
                    return false;
                };

                $scope.onDropComplete = function (data, proj, col) {
                    if (col.id === data.column && proj.id === data.project) {
                        return;
                    }
                    $scope.countCards(data);
                    var right = $scope.getRightLeafCol(col),
                        left = $scope.getLeftLeafCol(col),
                        move,
                        prevCol = Underscore.where($scope.allCols, {'id': data.column})[0],
                        highestPriorityCol = Underscore.where($scope.allCols, {'is_high_priority': true})[0],
                        colsLeftOfHighPriColumn = $scope.getLeftCols(highestPriorityCol, $scope.leafCols);

                    // when card is not moved one place right, one left or on the same column
                    // and when card isn't moved from acceptance test column to one before or on high priority column
                    if (!((right && right.id === data.column) || (left && left.id === data.column)) &&
                            !(prevCol.acceptance_test && (highestPriorityCol === col || Underscore.contains(colsLeftOfHighPriColumn, col)) && $scope.isPO)) {
                        $scope.notify('Error', 'This move is forbidden!');
                        return;
                    }
                    if (prevCol.acceptance_test && (highestPriorityCol === col || Underscore.contains(colsLeftOfHighPriColumn, col))) {
                        if (data.type !== 'silverBullet') {
                            data.type = 'rejected';
                        }
                    }
                    if ($scope.wipError(col)) {
                        move = {
                            card: data.id,
                            user: $scope.session.userid,
                            from_position: data.column,
                            to_position: col.id,
                            is_legal: false
                        };
                        $scope.notify('Warning', 'You have exceeded WIP limit! Do you want to move your card anyway?', true)
                            .then(function () {
                                //data.project = proj.id;
                                data.column = col.id;
                                BoardService.createMove(move);
                                BoardService.updateCard(data);
                            });
                    } else {
                        move = {
                            card: data.id,
                            user: $scope.session.userid,
                            from_position: data.column,
                            to_position: col.id
                        };
                        //data.project = proj.id;
                        data.column = col.id;
                        BoardService.createMove(move);
                        BoardService.updateCard(data);
                    }
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
                /*$scope.getMaxSubColsLen = function (cols) {
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
            }]);
}());