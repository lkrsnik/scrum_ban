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

            $scope.subset = {
                'display_type': 'avgLeadTime'
            };

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

            function getDate(date, dateOnly) {
                if (date === null || !date) {
                    return null;
                }
                if (dateOnly) {
                    return (new Date(date)).setHours(0, 0, 0, 0);
                }
                return (new Date(date));
            }

            $scope.getColsBetween = function (colFrom, colTo, cols) {
                if (!colFrom.location) {
                    colFrom = Underscore.findWhere(cols, { 'id': colFrom });
                }
                if (!colTo.location) {
                    colTo = Underscore.findWhere(cols, { 'id': colTo });
                }
                var result = Underscore.filter(cols, function (c) {
                    return colFrom.location <= c.location && c.location <= colTo.location;
                });
                return Underscore.sortBy(result, 'location');
            };

            $scope.getRightCols = function (col, cols) {
                if (!col) {
                    return cols;
                }
                if (!col.location) {
                    col = Underscore.findWhere(cols, { 'id': col });
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

            $scope.showAnalytics = function (subset) {
                // Check if no columns are set
                if (!subset.column_from || !subset.column_to) {
                    return;
                }
                var i, moves, fromMove, toMove, getMovesSuccessFun, dateMoves, subsetCols,
                    allDateMoves, firstDate, lastDate, days, day, dataObj, dateMove;

                subsetCols = $scope.getColsBetween(subset.column_from, subset.column_to, $scope.allCols).reverse();
                allDateMoves = [];
                days = [];

                getMovesSuccessFun = function (i) {
                    return function (data) {
                        moves = Underscore.sortBy(data, function (move) { return getDate(move.date); });

                        // Look if we are creating an average lead time diagram or cumulative diagram
                        if (subset.display_type === 'avgLeadTime') {
                            fromMove = Underscore.first(Underscore.where(moves, {to_position: subset.column_from.id}));
                            toMove = Underscore.last(Underscore.where(moves, {to_position: subset.column_to.id}));
                            if (!fromMove || !toMove) {
                                $scope.subsetCards[i].averageLeadTime = 0;
                            } else {
                                $scope.subsetCards[i].averageLeadTime = days_between(getDate(fromMove.date), getDate(toMove.date));
                                $scope.averageLeadTimeSum += $scope.subsetCards[i].averageLeadTime;
                            }
                        } else {
                            // Cumulative flow diagram
                            dateMoves = Underscore.groupBy(moves, function (move) {
                                return move.date.substring(0, 10);
                            });
                            $scope.subsetCards[i].position = -1;

                            dateMoves = Underscore.map(dateMoves, function (moves) {
                                var move = Underscore.last(moves);
                                move.date = new Date(move.date.substring(0, 10));

                                return move;
                            });

                            allDateMoves = allDateMoves.concat(dateMoves);
                        }

                    };
                };
                $scope.subsetCards = $scope.allCards;
                $scope.averageLeadTimeSum = 0;

                $scope.subsetCards = Underscore.filter($scope.allCards, function (x) {

                    return ((!subset.project || subset.project === x.project) &&
                        (!subset.points_from || subset.points_from <= x.story_points) &&
                        (!subset.points_to || subset.points_to >= x.story_points) &&
                        (!subset.type || subset.type === x.type) &&
                        (!subset.create_start_date || getDate(subset.create_start_date, true) <= getDate(x.creation_date, true)) &&
                        (!subset.create_end_date || getDate(subset.create_end_date, true) >= getDate(x.creation_date, true)) &&
                        (!subset.finished_start_date || getDate(subset.finished_start_date, true) <= getDate(x.done_date, true)) &&
                        (!subset.finished_end_date || getDate(subset.finished_end_date, true) >= getDate(x.done_date, true)) &&
                        (!subset.development_start_date || getDate(subset.development_start_date, true) <= getDate(x.development_start_date, true)) &&
                        (!subset.development_end_date || getDate(subset.development_end_date, true) >= getDate(x.development_start_date, true))
                        );
                });
                $scope.getMovesPromises = [];
                for (i = 0; i < $scope.subsetCards.length; i += 1) {
                    $scope.getMovesPromises.push(BoardService.getMoves($scope.subsetCards[i].id)
                        .success(getMovesSuccessFun(i)));
                }

                $q.all($scope.getMovesPromises)
                    .then(function () {
                        if (subset.display_type === 'avgLeadTime') {
                            $scope.subsetCards = Underscore.filter($scope.subsetCards, function (c) {
                                return c.averageLeadTime !== 0;
                            });

                            $scope.chartObject.type = 'ColumnChart';
                            $scope.chartObject.options.vAxis.title = 'Days';
                            $scope.chartObject.options.hAxis.title = 'Cards';
                            $scope.chartObject.options.isStacked = false;
                            $scope.chartObject.data.cols = [{
                                "id": "cardName",
                                "label": "Card Name",
                                "type": "string",
                                "p": {}
                            }, {
                                "id": "averageLeadTime",
                                "label": "Average Lead Time",
                                "type": "number",
                                "p": {}
                            }];

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
                                Math.round(($scope.averageLeadTimeSum / $scope.subsetCards.length) * 100) / 100;
                        } else {
                            // Cumulative flow diagram
                            allDateMoves = Underscore.sortBy(allDateMoves, 'date');

                            firstDate = angular.copy(Underscore.first(allDateMoves).date);
                            lastDate = Underscore.last(allDateMoves).date;

                            while (firstDate <= lastDate) {
                                dataObj = {
                                    'date': firstDate,
                                    'cols': subsetCols
                                };

                                days.push(angular.copy(dataObj));

                                firstDate.setDate(firstDate.getDate() + 1);
                            }

                            $scope.chartObject.type = 'AreaChart';
                            $scope.chartObject.options.vAxis.title = 'Number of cards in a column';
                            $scope.chartObject.options.hAxis.title = 'Days';
                            $scope.chartObject.options.isStacked = true;
                            $scope.chartObject.data.cols = [{
                                "id": "date",
                                "label": "Date",
                                "type": "string",
                                "p": {}
                            }];

                            Underscore.map(subsetCols, function (c) {
                                $scope.chartObject.data.cols.push({
                                    "id": c.id,
                                    "label": c.name,
                                    "type": "number",
                                    "p": {}
                                });
                            });

                            $scope.chartObject.data.rows = Underscore.map(days, function (d) {
                                day = {
                                    "c": [{
                                        "v": d.date.toDateString()
                                    }]
                                };

                                // For every day check if card changed location
                                $scope.subsetCards = Underscore.map($scope.subsetCards, function (card) {
                                    dateMove = Underscore.find(allDateMoves, function (dm) {
                                        // If card has changed position on this day
                                        return dm.date.getTime() === d.date.getTime() && dm.card === card.id;
                                    });
                                    if (dateMove) {
                                        card.position = dateMove.to_position;
                                    }
                                    return card;
                                });

                                // Then update cols data according to every card location
                                day.c = day.c.concat(Underscore.map(d.cols, function (c) {
                                    c = Underscore.where($scope.subsetCards, { 'position': c.id });
                                    return {
                                        "v": c.length
                                    };
                                }));
                                return day;
                            });
                        }
                    });
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
                        "id": "averageLeadTime",
                        "label": "Average Lead Time",
                        "type": "number",
                        "p": {}
                    }],
                    "rows": []
                },
                "options": {
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