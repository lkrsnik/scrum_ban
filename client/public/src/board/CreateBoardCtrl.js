/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateBoardCtrl',
        ['$scope', 'BoardService', '$location', '$q', function ($scope, BoardService, $location, $q) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                        $scope.redirectNonAuthenticated('/');
                    }, function () { // In case session promise fails
                        $scope.redirectNonScrumMaster('/');
                        $scope.redirectNonAuthenticated('/');
                    });
            } else {
                $scope.redirectNonAuthenticated('/');
                $scope.redirectNonScrumMaster('/');
            }
            $scope.boards = null;

            $scope.resetEmailValidity = function () {
                $scope.createBoardForm.email.$setValidity('emailExists', true);
            };

            $scope.createBoard = function (board) {
                if ($scope.boardS === null || $scope.boardS === undefined) {
                    // create new board
                    BoardService.createBoard(board)
                        .success(function () {
                            $location.path('/');
                        })
                        .error(function (error, status) {
                            switch (status) {
                            case (400):
                                if (error.username &&
                                        error.username.indexOf('User with this Username already exists.')) {
                                    $scope.createBoardForm.email.$setValidity('emailExists', false);
                                }

                                //$scope.createBoardForm.email.$setValidity('emailExists', false);
                                break;
                            }
                        });
                } else {
                    // copy selected board
                    BoardService.createBoard(board)
                        .success(function (created) {
                            var selected;
                            selected = $scope.boardS;
                            BoardService.getColumns(selected.id)
                                .success(function (data) {
                                    var topLevelCols = Underscore.filter(data, function (c) {
                                            return c.parent_column === null;
                                        }),
                                        newCol = {},
                                        i,
                                        compl = [];
                                    for (i = 0; i < data.length; i += 1) {
                                        newCol = {
                                            "acceptance_test": data[i].acceptance_test,
                                            "board": created.id,
                                            "is_border": data[i].is_border,
                                            "is_high_priority": data[i].is_high_priority,
                                            "location": data[i].location,
                                            "name": data[i].name,
                                            "parent_column": data[i].parent_column,
                                            "wip": data[i].wip
                                        };
                                        compl.push(BoardService.createColumn(newCol));
                                    }
                                    $q.all(compl).then(function () {
                                        var complChild = [],
                                            parent,
                                            newParent,
                                            newChild,
                                            childCols = Underscore.difference(data, topLevelCols),
                                            findTLC = function (c) {
                                                return childCols[i].parent_column === c.id;
                                            },
                                            findNP = function (col) {
                                                return col.name === parent.name;
                                            },
                                            findNC = function (col) {
                                                return col.name === childCols[i].name && col.parent_column === parent.id;
                                            };
                                        BoardService.getColumns(created.id)
                                            .success(function (data) {
                                                // take newly added cols
                                                console.log(data);
                                                for (i = 0; i < childCols.length; i += 1) {
                                                    parent = Underscore.find(topLevelCols, findTLC);
                                                    newParent = Underscore.find(data, findNP);
                                                    newChild = Underscore.find(data, findNC);
                                                    newChild.parent_column = newParent.id;
                                                    console.log(childCols[i]);
                                                    console.log(parent);
                                                    console.log(newParent);
                                                    console.log(newChild);
                                                    complChild.push(BoardService.updateColumn(newChild));
                                                }
                                                $q.all(complChild).then(function () {
                                                    $location.path('/');
                                                });
                                            });

                                    });
                                });
                        });
                }
            };

            $scope.listBoards = function () {
                BoardService.getBoards()
                    .success(function (data) {
                        $scope.boards = data;
                        // is this even needed??
                        // TODO_: POPRAVI, KO BO NAREJENO, DA SE PRI TABLI SHRANI USER, KI JO JE KREIRAL! - zlistaj le tiste table
                        /*TeamService.getUserTeams()
                            .success(function (uteams) {
                                uteams = Underscore.filter(uteams, function (u) {
                                    return u.user === $scope.session.userid;
                                });
                                console.log(uteams);
                                if (!$scope.session.is_staff) {
                                    $scope.boards = Underscore
                                }
                            });
                        */
                    });
            };
            $scope.listBoards();
        }]);
}());