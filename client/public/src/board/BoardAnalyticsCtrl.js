/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardAnalyticsCtrl',
        ['$scope', 'ROLES', '$routeParams', 'BoardService', 'ProjectService', function ($scope, ROLES, $routeParams, BoardService, ProjectService) {

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
                "rejected",
                ""
            ];
            $scope.specialCols = {
                'borderCols': [],
                'acceptanceTestCol': null,
                'highPriorityCol': null
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

            BoardService.getCards()
                .success(function (data) {
                    $scope.allCards = data;
                    $scope.subsetCards = data;
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
                if (date === null) {
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
                var ONE_DAY, date1_ms, date2_ms, difference_ms;
                // The number of milliseconds in one day
                ONE_DAY = 1000 * 60 * 60 * 24;

                // Convert both dates to milliseconds
                date1_ms = date1.getTime();
                date2_ms = date2.getTime();

                // Calculate the difference in milliseconds
                difference_ms = Math.abs(date1_ms - date2_ms);

                // Convert back to days and return
                return Math.round(difference_ms / ONE_DAY);

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
            function getDateOfColumnCard(card, column, type) {
                var moves;
                BoardService.getMoves(card.id)
                    .success(function (data) {
                        console.log("moves");
                        console.log(data);
                        moves = Underscore.where(data, {to_position: column.id});
                        moves = Underscore.sortBy(moves, function (move) { return getDate(move.date); });
                        if (!moves) {
                            return null;
                        }
                        if (type === "first") {
                            return getDate((Underscore.first(moves)).date);
                        }
                        if (type === "last") {
                            return getDate((Underscore.last(moves)).date);
                        }
                    });
                return null;
            }


            $scope.showAnalytics = function (subset) {
                var startOfDevelopmentCol, doneCol, i, first, second, averageLeadTime;
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
                for (i = 0; i < $scope.subsetCards.length; i += 1) {
                    first = getDateOfColumnCard($scope.subsetCards[i], $scope.allCols[0], "first");
                    second = getDateOfColumnCard($scope.subsetCards[i], $scope.allCols[1], "last");
                    if (first !== null  &&  second !== null) {
                        averageLeadTime = days_between(first, second);
                    } else {
                        averageLeadTime = null;
                    }
                    $scope.subsetCards[i].averageLeadTime = averageLeadTime;
                }
            };
        }]);
}());