/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateTeamCtrl',
        ['$scope', 'TeamService', 'UserService', function ($scope, TeamService, UserService) {

            $scope.scrumMasters = {};
            $scope.teamMembers = {};
            $scope.productOwners = {};

            $scope.createTeam = function (team, productOwner, scrumMaster, members) {
                console.log('Creating team:');
                console.log(team);
                console.log(productOwner);
                console.log(scrumMaster);
                console.log(members);

                TeamService.createTeam(team)
                    .success(function (data) {
                        console.log('Team created');
                        console.log(data);
                        console.log(productOwner);
                          var newTU = 
                         {
                             "team": data.id,
                             "user": productOwner.id,
                             "is_active": true,
                         };
                         TeamService.createUserTeam(newTU)
                        .success(function (data) {
                            console.log('TeamUser created');
                              var newTU = 
                             {
                                 "team": data.id,
                                 "user": productOwner,
                                 "is_active":true,
                             };
                        });

                    });
            };

            $scope.getGroups = function () {
                UserService.getUsers()
                    .success(function (data) {
                        console.log('Team retrieved');
                        $scope.scrumMasters = Underscore.filter(data, function (d) {return Underscore.where(d.groups, {'name': 'ScrumMaster'}).length > 0; });
                        $scope.teamMembers = Underscore.filter(data, function (d) {return Underscore.where(d.groups, {'name': 'TeamMember'}).length > 0; });
                        $scope.productOwners = Underscore.filter(data, function (d) {return Underscore.where(d.groups, {'name': 'ProductOwner'}).length > 0; });
                    });
            };

            $scope.getGroups();

        }]);
}());