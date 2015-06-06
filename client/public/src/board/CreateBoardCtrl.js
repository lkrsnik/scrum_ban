/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateBoardCtrl',
        ['$scope', 'BoardService', '$location', function ($scope, BoardService, $location) {

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

            $scope.resetEmailValidity = function () {
                $scope.createBoardForm.email.$setValidity('emailExists', true);
            };

            $scope.createBoard = function (board) {
                console.log(board);
                BoardService.createBoard(board)
                    .success(function () {
                        //console.log('User created');
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
            };
        }]);
}());