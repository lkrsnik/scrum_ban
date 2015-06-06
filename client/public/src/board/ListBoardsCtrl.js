/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListBoardsCtrl',
        ['$scope', 'BoardService', 'ROLES', function ($scope, BoardService, ROLES) {

            $scope.ROLES = ROLES;

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

            $scope.getBoards = function () {
                BoardService.getBoards()
                    .success(function (data) {
                        $scope.boards = data;
                        //$scope.users = Underscore.filter(data, function (user) { return user.is_active; });
                    });
            };

            $scope.getBoards();
        }]);
}());