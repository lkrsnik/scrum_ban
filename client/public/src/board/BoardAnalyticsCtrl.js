/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardAnalyticsCtrl',
        ['$scope', 'ROLES', '$routeParams', 'BoardService', 'ProjectService', '$q', function ($scope, ROLES, $routeParams, BoardService, ProjectService, $q) {

            if (!$scope.session) {
                $scope.promises.sessionPromise
                    .then(function () {
                        $scope.redirectNonAuthenticated('/');
                    }, function () {  // In case session promise fails
                        $scope.redirectNonAuthenticated('/');
                    });
            } else {
                $scope.redirectNonAuthenticated('/');
            }

            $scope.ROLES = ROLES;
            $scope.yourOwnedSMProjects = [];
            $scope.types = [
                "newFunctionality",
                "silverBullet",
                "rejected"
            ];
            $scope.specialCols = {
                'borderCols': [],
                'acceptanceTestCol': null,
                'highPriorityCol': null
            };
            $scope.subsetCards = [];

            BoardService.getColumns($routeParams.boardId)
                .success(function (data) {
                    $scope.allCols = data;
                    $scope.specialCols.borderCols = Underscore.sortBy(Underscore.where($scope.allCols, { 'is_border': true }), 'location');
                    $scope.specialCols.acceptanceTestCol = Underscore.findWhere($scope.allCols, { 'acceptance_test': true });
                    $scope.leafCols = Underscore.sortBy(Underscore.filter($scope.allCols, function (c) {
                        return c.isLeafCol;
                    }), 'location');
                });

            BoardService.getBoardCards($routeParams.boardId)
                .success(function (data) {
                    $scope.allCards = data;
                    //$scope.subsetCards = data;
                });

            BoardService.getBoard($routeParams.boardId)
                .success(function (data) {
                    $scope.board = data;
                });

            ProjectService.getProjectbyBoardUserRole($routeParams.boardId, "ScrumMaster")
                .success(function (data) {
                    $scope.yourOwnedSMProjects = data;
                });

            function getDate(date) {
                if (date === null || !date) {
                    return null;
                }
                return (new Date(date));
            }

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

            function days_between(date1, date2) {
                //var ONE_DAY, date1_ms, date2_ms, difference_ms;
                // The number of milliseconds in one day
                //ONE_DAY = 1000 * 60 * 60 * 24;

                // Convert both dates to milliseconds
                //date1_ms = date1.getTime();
                //date2_ms = date2.getTime();

                // Calculate the difference in milliseconds
                //difference_ms = Math.abs(date1_ms - date2_ms);
                return Math.round((((Math.abs(date1 - date2) / 3600000) / 24)) * 100) / 100;
                // Convert back to days and return
                //return Math.round(difference_ms / ONE_DAY);

            }

            /*function getAverageLeadTime(card, start, end) {
                var from, to, cardALT, newCard;
                cardALT = {};
                cardALT.id = card.id;
                newCard = {
                    to_itak_se_ne_dela: null
                };
                cardALT.leadTime = Array.apply(null, new Array(days_between(start, end))).map(Number.prototype.valueOf, 0);
                cardALT.leadTime = Underscore.map(cardALT.leadTime, function () { return newCard; });
                from = getDate(card.creation_date);
                to = getDate(card.completion_date);
                if (to === null) {
                    to = new Date();
                    to = to.getDate();
                }
                //increase for one day
                from.setDate(from.getDate() + 1);
            }
            */
            /*$scope.movePromises = [];
            $scope.firstDates = [];
            $scope.lastDates = [];
            function getDateOfColumnCard(card, column, type) {
                var moves, movePromise;
                movePromise = BoardService.getMoves(card.id)
                    .success(function (data) {
                        console.log(new Date() + "wwq");
                        if (type === "first") {
                            console.log(new Date() + "wwqasdads");
                            moves = Underscore.where(data, {from_position: column.id});
                        } else if (type === "last") {
                            moves = Underscore.where(data, {to_position: column.id});
                        }
                        console.log(new Date() + "člkčlk");
                        moves = Underscore.sortBy(moves, function (move) { return getDate(move.date); });
                        if (!moves || moves.length === 0) {
                            return;
                        }
                        console.log(new Date());
                        if (type === "first") {
                            $scope.firstDates.push(getDate((Underscore.first(moves)).date));
                        } else if (type === "last") {
                            $scope.lastDates.push(getDate((Underscore.last(moves)).date));
                        }
                        console.log(new Date());
                    });
                $scope.movePromises.push(movePromise);
            }


            $scope.showAnalytics = function (subset) {
                var startOfDevelopmentCol, doneCol, i, averageLeadTime;
                $scope.averageLeadTimeSum = 0;
                $scope.cardsAndTime = [];
                //-- časovni interval, v katerem je bila kartica končana (premaknjena v stolpec, ki sledi stolpcu za sprejemno testiranje)
                doneCol = $scope.getRightLeafCol($scope.specialCols.acceptanceTestCol);
                //-- časovni interval, v katerem se je dejansko pričel razvoj - prvi border column
                startOfDevelopmentCol = $scope.specialCols.borderCols[0];
                $scope.subsetCards = Underscore.filter($scope.allCards, function (x) {
                    return ((!subset.project || subset.project === x.project) &&
                        (!subset.points_from || subset.points_from <= x.story_points) &&
                        (!subset.points_to || subset.points_to >= x.story_points) &&
                        (!subset.type || subset.type === "" || subset.type === x.type) &&
                        (subset.create_start_date === null || subset.create_start_date <= getDate(x.creation_date)) &&
                        (subset.create_end_date === null || subset.create_end_date >= getDate(x.creation_date)) &&
                        (subset.finished_start_date === null || subset.finished_start_date <= getDateOfColumnCard(x, doneCol, "last")) &&
                        (subset.finished_end_date === null || subset.finished_end_date >= getDateOfColumnCard(x, doneCol, "last")) &&
                        (subset.development_start_date === null || subset.development_start_date <= getDateOfColumnCard(x, startOfDevelopmentCol, "first")) &&
                        (subset.development_end_date === null || subset.development_end_date >= getDateOfColumnCard(x, startOfDevelopmentCol, "first"))
                        );
                });
                console.log(new Date());
                movePromise = BoardService.getMoves(card.id);
                for (i = 0; i < $scope.subsetCards.length; i += 1) {
                    getDateOfColumnCard($scope.subsetCards[i], $scope.subset.column_from, "first");
                    //getDateOfColumnCard($scope.subsetCards[i], $scope.subset.column_to, "last");
                }
                $q.all($scope.movePromises).then(function () {
                    console.log(new Date());
                    for (i = 0; i < $scope.subsetCards.length; i += 1) {
                        //if (firstDates.length !== null  &&  second !== null) {
                        averageLeadTime = days_between($scope.firstDates[i], $scope.lastDates[i]);
                        //} else {
                        //    averageLeadTime = null;
                        //}S
                        console.log(averageLeadTime);
                        $scope.cardsAndTime[i] =
                            {
                                card: $scope.subsetCards[i].name,
                                time: averageLeadTime
                            };
                        $scope.subsetCards[i].averageLeadTime = averageLeadTime;
                        $scope.averageLeadTimeSum += averageLeadTime;

                    }
                    
                    console.log($scope.cardsAndTime);
                });
            };*/


            $scope.showAnalytics = function (subset) {
                // Check if no columns are set
                if (!subset.column_from || !subset.column_to) {
                    return;
                }
                var i, moves, fromMove, toMove, getMovesSuccessFun;
                getMovesSuccessFun = function (i) {
                    return function (data) {
                        // Sort moves by date
                        moves = Underscore.sortBy(data, function (move) { return getDate(move.date); });

                        fromMove = Underscore.first(Underscore.where(moves, {to_position: subset.column_from.id}));
                        toMove = Underscore.last(Underscore.where(moves, {to_position: subset.column_to.id}));
                        if (!fromMove || !toMove) {
                            $scope.subsetCards[i].averageLeadTime = 0;
                        } else {
                            $scope.subsetCards[i].averageLeadTime = days_between(getDate(fromMove.date), getDate(toMove.date));
                            $scope.averageLeadTimeSum += $scope.subsetCards[i].averageLeadTime;
                        }
                    };
                };
                $scope.subsetCards = $scope.allCards;
                $scope.averageLeadTimeSum = 0;

                $scope.subsetCards = Underscore.filter($scope.allCards, function (x) {

                    return ((!subset.project || subset.project === x.project) &&
                        (!subset.points_from || subset.points_from <= x.story_points) &&
                        (!subset.points_to || subset.points_to >= x.story_points) &&
                        (!subset.type || subset.type === "all" || subset.type === x.type) &&
                        (!subset.create_start_date || getDate(subset.create_start_date) <= getDate(x.creation_date)) &&
                        (!subset.create_end_date || getDate(subset.create_end_date) >= getDate(x.creation_date)) &&
                        (!subset.finished_start_date || getDate(subset.finished_start_date) <= getDate(x.done_date)) &&
                        (!subset.finished_end_date || getDate(subset.finished_end_date) >= getDate(x.done_date)) &&
                        (!subset.development_start_date || getDate(subset.development_start_date) <= getDate(x.development_start_date)) &&
                        (!subset.development_end_date || getDate(subset.development_end_date) >= getDate(x.development_start_date))
                        );
                });
                $scope.getMovesPromises = [];
                for (i = 0; i < $scope.subsetCards.length; i += 1) {
                    $scope.getMovesPromises.push(BoardService.getMoves($scope.subsetCards[i].id)
                        .success(getMovesSuccessFun(i)));
                }

                $q.all($scope.getMovesPromises)
                    .then(function () {
                        $scope.updateChart();
                    });
            };

            $scope.updateChart = function () {
                $scope.chartObject.data.rows = Underscore.map($scope.subsetCards, function (card) {
                    return {
                        "c": [{
                            "v": card.name
                        }, {
                            "v": card.averageLeadTime
                        }]
                    };
                });

                $scope.chartObject.options.title = "Cumulative average lead time: " +
                    Math.round($scope.averageLeadTimeSum * 100) / 100;
            };

            $scope.chartObject = {
                "type": "ColumnChart",
                "displayed": true,
                "data": {
                    "cols": [{
                        "id": "cardName",
                        "label": "Card Name",
                        "type": "string",
                        "p": {}
                    }, {
                        "id": "averagLeadTime",
                        "label": "Average Lead Time",
                        "type": "number",
                        "p": {}
                    }],
                    "rows": []
                },
                "options": {
                    "title": "Cumulative average lead time: ",
                    "isStacked": "false",
                    "fill": 4,
                    "displayExactValues": true,
                    "vAxis": {
                        "title": "Days",
                        "gridlines": {
                            "count": 5
                        }
                    },
                    "hAxis": {
                        "title": "Cards"
                    }
                },
                "formatters": {}
            };
        }]);
}());