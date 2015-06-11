/*global angular, console, Underscore, alert */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardCtrl',
        ['$scope', 'BoardService', '$routeParams', 'ngDialog', 'COL_DIM', 'ProjectService', 'UserService', '$location', '$filter',
            function ($scope, BoardService, $routeParams, ngDialog, COL_DIM, ProjectService, UserService, $location, $filter) {

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
                $scope.newCard = {};

                // Redirect init
                $scope.go = function (path) {
                    $location.path($location.path() + path);
                };

                BoardService.getCriticalCardsByUser($scope.session.userid)
                    .success(function (data) {
                        if (!data[0]) {
                            //$scope.days_left;
                            console.log("here");
                        } else {
                            $scope.days_left = data[0].days_left;
                        }
                    });


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
                            console.log($scope.newCol.wip);
                            // show warning only if previously set column didn't exceed WIP value
                            if ($scope.wipErrorOnColumnEdit($scope.newCol) && !$scope.wipErrorOnColumnEdit(oldCol)) {
                                console.log("napaka");
                                $scope.notify('Warning', 'You have exceeded WIP limit in this column! Do you still want to update WIP value?', true)
                                    .then(function () {
                                        var wipViolation,
                                            i,
                                            completed = [];

                                        BoardService.getCards()
                                            .success(function (data) {
                                                data = Underscore.filter(data, function (c) {
                                                    return c.column === $scope.newCol.id && c.is_active;
                                                });
                                                for (i = 0; i < data.length; i += 1) {
                                                    wipViolation = {
                                                        card: data[i].id,
                                                        user: $scope.session.userid,
                                                        column: $scope.newCol.id
                                                    };
                                                    completed.push(BoardService.createWipViolation(wipViolation));
                                                }
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
                                    });
                            } else {
                                BoardService.updateColumn($scope.newCol)
                                    .success(function () {
                                        if (oldCol.location !== $scope.newCol.location) {
                                            $scope.deleteSubColsLocations($scope.newCol);
                                            $scope.recalculateSubColsLocations($scope.newCol);
                                        }

                                        $scope.allCols = Underscore.without($scope.allCols, oldCol);
                                        $scope.proccessSavedColumn($scope.newCol);
                                    });
                            }
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
                    if (!col) {
                        return [];
                    }
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
                    if (!col) {
                        return [];
                    }
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
                            'width': col.narrow ? COL_DIM.narrowWidth : $scope.getColsWidth(subCols, depth + 1),
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

                $scope.getParentCols = function (col) {
                    var parentCol = Underscore.findWhere($scope.allCols, { 'id': col.parent_column });
                    if (!parentCol) {
                        return [col];
                    }
                    return [col].concat($scope.getParentCols(parentCol));
                };

                $scope.resizeColumn = function (col) {
                    col.narrow = !col.narrow;

                    BoardService.updateColumn(col);

                    $scope.updateCols();
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
                $scope.getCards = function () {
                    BoardService.getCards()
                        .success(function (data) {
                            $scope.allCards = data;
                        });
                };
                $scope.getCards();

                UserService.getUsers()
                    .success(function (data) {
                        $scope.allUsers = data;
                    });

                function createMove(move) {
                    var toColumns, fromColumns, i, j, toCol, fromCol;
                    toCol = Underscore.findWhere($scope.allCols, {'id': move.to_position });
                    toColumns = $scope.getParentCols(toCol).reverse();
                    if (move.from_position === null) {
                        for (i = 0; i < toColumns.length; i += 1) {
                            move.to_position = toColumns[i].id;
                            BoardService.createMove(move);
                        }
                    } else {
                        fromCol = Underscore.findWhere($scope.allCols, {'id': move.from_position });
                        fromColumns = $scope.getParentCols(fromCol).reverse();
                        for (i = 0; i < toColumns.length; i += 1) {
                            for (j = 0; j < fromColumns.length; j += 1) {
                                if (toColumns[i].id !== fromColumns[j].id) {
                                    move.to_position = toColumns[i].id;
                                    move.from_position = fromColumns[j].id;
                                    BoardService.createMove(angular.copy(move));
                                }
                            }
                        }
                    }
                    return 0;
                }
                function isCritical(card) {
                    var date1, date2;
                    if (!card.completion_date) {
                        return false;
                    }
                    date1 = new Date(card.completion_date);
                    date2 = new Date();
                    date2.setDate(date2.getDate() + $scope.days_left);
                    date2.setHours(0, 0, 0, 0);
                    return (date2 >= date1);
                }
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
                        entry.is_critical = isCritical(entry);
                        if (entry.is_critical && !entry.done_date) {
                            entry.classCritical = "panel-body-critical";
                        } else {
                            entry.classCritical = "";
                        }
                    });
                    return Underscore.sortBy(cards, 'id');
                };

                $scope.updateCritical = function () {
                    $scope.allCards.forEach(function (entry) {
                        entry.is_critical = isCritical(entry);
                        if (entry.is_critical && !entry.done_date) {
                            entry.classCritical = "panel-body-critical";
                        } else {
                            entry.classCritical = "";
                        }
                    });
                };

                $scope.onProjectSelectionChange = function (type) {
                    $scope.showCreateCardForm = true;
                    if (type === 'ScrumMaster') {
                        $scope.type = 'silverBullet';
                        $scope.cardColumn = $scope.specialCols.highPriorityCol;
                    }
                    if (type === 'ProductOwner') {
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
                            $scope.newCard.completion_date = $filter('date')($scope.newCard.completion_date, 'yyyy-MM-ddTHH:mm');
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
                                    createMove(move);
                                });
                        });
                };

                $scope.editCard = function (card) {
                    $scope.card = card;
                    $scope.card.story_points = parseFloat($scope.card.story_points);
                    $scope.card.username = Underscore.where($scope.allUsers, {'id': $scope.card.user})[0];
                    $scope.newCard = JSON.parse(JSON.stringify($scope.card));
                    if ($scope.specialCols.borderCols.length > 1) {
                        var leftBorderCols = $scope.getLeftCols($scope.specialCols.borderCols[0], $scope.leafCols),
                            isLeft = Underscore.where(leftBorderCols, {'id': $scope.card.column}).length > 0,
                            rightBorderCols = $scope.getRightCols($scope.specialCols.borderCols[1], $scope.leafCols),
                            isRight = Underscore.where(rightBorderCols, {'id': $scope.card.column}).length > 0;
                        if (($scope.isPO || $scope.isSM) && isLeft) {
                            $scope.newCard.readOnly = false;
                        } else if (!isLeft && !isRight && !$scope.isPO) {
                            $scope.newCard.readOnly = false;
                        } else {
                            $scope.newCard.readOnly = true;
                        }
                    } else {
                        $scope.newCard.readOnly = true;
                    }
                    BoardService.getWipViolations(card.id)
                        .success(function (data) {
                            var i;
                            for (i = 0; i < data.length; i += 1) {
                                data[i].date = $filter('date')(data[i].date, 'yyyy-MM-dd');
                                data[i].column = Underscore.where($scope.allCols, {'id': data[i].column})[0].name;
                            }
                            $scope.newCard.violations = data;
                        });
                    BoardService.getMoves(card.id)
                        .success(function (data) {
                            var i,
                                fromLeaf,
                                toLeaf,
                                leafMoves = [],
                                fromCol,
                                toCol;
                            for (i = 0; i < data.length; i += 1) {
                                fromCol = Underscore.findWhere($scope.allCols, {'id': data[i].from_position});
                                if (!fromCol) {
                                    fromLeaf = true;
                                } else {
                                    fromLeaf = fromCol.isLeafCol;
                                }
                                /*if (fromLeaf) {
                                    test1 = Underscore.where($scope.allCols, {'id': data[i].from_position});
                                    fromLeaf = Underscore.where($scope.allCols, {'id': data[i].from_position})[0].isLeafCol;
                                } else {
                                    fromLeaf = true;
                                }*/

                                toCol = Underscore.findWhere($scope.allCols, {'id': data[i].to_position});
                                toLeaf = toCol.isLeafCol;
                                data[i].date = $filter('date')(data[i].date, 'yyyy-MM-dd');
                                if (data[i].is_legal) {
                                    data[i].legal = '';
                                } else {
                                    data[i].legal = 'danger';
                                }
                                if (fromLeaf && toLeaf) {
                                    leafMoves.push(data[i]);
                                }
                            }
                            $scope.newCard.moves = leafMoves;
                        });
                    $scope.newCard.completion_date = $filter('date')($scope.newCard.completion_date, 'yyyy-MM-dd');
                    ngDialog.openConfirm({
                        template: '/static/html/board/editCard.html',
                        className: 'ngdialog-theme-plain custom-width',
                        scope: $scope
                    })
                        .then(function () {
                            $scope.newCard.completion_date = $filter('date')($scope.newCard.completion_date, 'yyyy-MM-ddTHH:mm');
                            BoardService.updateCard($scope.newCard)
                                .success(function () {
                                    $scope.allCards = Underscore.without($scope.allCards, card);
                                    $scope.allCards.push($scope.newCard);
                                });
                        });
                };
                function getDate(date) {
                    if (date === null || !date) {
                        return null;
                    }
                    return (new Date(date));
                }

                $scope.showCritical = function () {
                    $scope.criticalCards = {};
                    BoardService.getCriticalCardsByUser($scope.session.userid)
                        .success(function (data) {
                            $scope.criticalCards = data;
                            ngDialog.openConfirm({
                                template: '/static/html/board/criticalCards.html',
                                className: 'ngdialog-theme-plain',
                                scope: $scope
                            })
                                .then(function () {
                                    if (!data[0].user) {
                                        $scope.criticalCards[0].user = $scope.session.userid;
                                        $scope.criticalCards.user = $scope.session.userid;
                                        BoardService.createCriticalCards($scope.criticalCards[0])
                                            .success(function (data) {
                                                $scope.days_left = data.days_left;
                                                $scope.updateCritical();
                                            });
                                    } else {
                                        BoardService.updateCriticalCards($scope.criticalCards[0])
                                            .success(function (data) {
                                                $scope.days_left = data.days_left;
                                                $scope.updateCritical();
                                            });
                                    }
                                });
                        });
                };

                $scope.showDeleted = function () {
                    var i, getMovesSuccessFun, moves;
                    getMovesSuccessFun = function (i) {
                        return function (data) {
                            moves = Underscore.sortBy(data, function (move) { return getDate(move.date); });
                            $scope.deletedCards[i].deleteDescription =  Underscore.last(moves).description;
                        };
                    };
                    BoardService.getBoardDeletedCards($routeParams.boardId)
                        .success(function (data) {
                            $scope.deletedCards = data;
                            for (i = 0; i < data.length; i += 1) {
                                BoardService.getMoves($scope.deletedCards[i].id)
                                    .success(getMovesSuccessFun(i));
                            }
                            ngDialog.openConfirm({
                                template: '/static/html/board/deletedCards.html',
                                className: 'ngdialog-theme-plain custom-width',
                                scope: $scope
                            });
                        });
                };

                $scope.deleteCard = function (card) {
                    $scope.card = card;
                    $scope.move = {
                        card: card.id,
                        user: $scope.session.userid,
                        from_position: card.column,
                        to_position: null,
                        description: ''
                    };

                    ngDialog.openConfirm({
                        template: '/static/html/board/deleteCard.html',
                        className: 'ngdialog-theme-plain',
                        scope: $scope
                    })
                        .then(function () {
                            BoardService.createMove($scope.move);
                            $scope.card.is_active = false;
                            BoardService.updateCard($scope.card)
                                .success(function () {
                                    $scope.allCards = Underscore.without($scope.allCards, card);
                                });
                        });
                };

                $scope.canDeleteCard = function (card) {
                    if ($scope.specialCols.borderCols.length > 1 || $scope.isSM) {
                        var leftBorderCols = $scope.getLeftCols($scope.specialCols.borderCols[0], $scope.leafCols),
                            isLeft = Underscore.where(leftBorderCols, {'id': card.column}).length > 0;
                        if (($scope.isPO && isLeft) || $scope.isSM) {
                            return true;
                        }
                        return false;
                    }
                    return false;
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
                    var parentColumn = Underscore.findWhere($scope.allCols, {'id': column.parent_column});
                    if (parentColumn) {
                        return $scope.wipError(parentColumn);
                    }
                    return false;
                };

                $scope.wipErrorOnColumnEdit = function (column) {
                    if ($scope.countCards(column) > column.wip) {
                        return true;
                    }
                    if (!column.parent_column) {
                        return false;
                    }
                    var parentColumn = Underscore.findWhere($scope.allCols, {'id': column.parent_column});
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
                    $scope.allCards = Underscore.without($scope.allCards, data);
                    if ($scope.wipError(col)) {
                        $scope.allCards.push(data);
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
                                if ($scope.getRightLeafCol($scope.specialCols.acceptanceTestCol) && col.id ===  $scope.getRightLeafCol($scope.specialCols.acceptanceTestCol).id) {
                                    data.done_date = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm');
                                }
                                if (col.id === $scope.specialCols.borderCols[0].id && data.development_start_date !== null) {
                                    data.development_start_date = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm');
                                }
                                createMove(move);
                                BoardService.updateCard(data);
                            });
                    } else {
                        $scope.allCards.push(data);
                        move = {
                            card: data.id,
                            user: $scope.session.userid,
                            from_position: data.column,
                            to_position: col.id
                        };
                        //data.project = proj.id;
                        data.column = col.id;
                        if ($scope.getRightLeafCol($scope.specialCols.acceptanceTestCol) && col.id ===  $scope.getRightLeafCol($scope.specialCols.acceptanceTestCol).id) {
                            data.done_date = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm');
                        }
                        if (col.id === $scope.specialCols.borderCols[0].id && data.development_start_date === null) {
                            data.development_start_date = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm');
                        }

                        createMove(move);
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