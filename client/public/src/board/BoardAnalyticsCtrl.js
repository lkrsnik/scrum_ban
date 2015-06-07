/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('BoardAnalyticsCtrl',
        ['$scope', 'ROLES', '$routeParams', 'BoardService', 'ProjectService', 'ngDialog', function ($scope, ROLES, $routeParams, BoardService, ProjectService, ngDialog) {

            $scope.ROLES = ROLES;
            $scope.yourOwnedSMProjects = [];
            $scope.types = [
                "newFunctionality",
                "silverBullet",
                "rejected",
                ""
            ];

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

            function getAverageLeadTime(card, start, end) {
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

            $scope.showAnalytics = function (subset) {
                var from = getDate($scope.allCards[0].creation_date);
                from.setDate(from.getDate() + 7);
                getAverageLeadTime($scope.allCards[0], getDate($scope.allCards[0].creation_date), from);
                $scope.subsetCards = Underscore.filter($scope.allCards, function (x) {
                    return ((!subset.project || subset.project === x.project) &&
                        (!subset.points_from || subset.points_from <= x.story_points) &&
                        (!subset.points_to || subset.points_to >= x.story_points) &&
                        (!subset.type || subset.type === "" || subset.type === x.type) &&
                        (subset.create_start_date === null || subset.create_start_date <= getDate(x.creation_date)) &&
                        (subset.create_end_date === null || subset.create_end_date >= getDate(x.creation_date)) &&
                        (subset.finished_start_date === null || subset.finished_start_date <= getDate(x.completion_date)) &&
                        (subset.finished_end_date === null || subset.finished_end_date >= getDate(x.completion_date)) &&
                        (subset.development_start_date === null || subset.development_start_date <= getDate(x.development_start_date)) &&
                        (subset.development_end_date === null || subset.development_end_date >= getDate(x.development_start_date))
                        );
                });

                ngDialog.openConfirm({
                    template: '/static/html/board/showAnalytics.html',
                    className: 'ngdialog-theme-plain',
                    scope: $scope
                })
                    .then(function () {
                        console.log("this is it");
                    });
            };
        }]);
}());