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

            function getAverageLeadTime(card) {
                var from, to;
                from = getDate(card.creation_date);
                to = getDate(card.completion_date);
                if (to === null) {
                    to = new Date();
                    to = to.getDate();
                }
                from.setDate(from.getDate() + 1);
            }

            $scope.showAnalytics = function (subset) {


                getAverageLeadTime($scope.allCards[0]);
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