/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateTeamCtrl',
        ['$scope', 'TeamService', 'UserService', function ($scope, TeamService, UserService) {

            $scope.scrumMasters = {};
            $scope.teamMembers = {};
            $scope.productOwners = {};
            $scope.userteamSM = null;
            $scope.userteamPO = null;
            var newRoleTeam, newRoleTeamTeamMember;

            $scope.getRoles = function () {
                UserService.getGroups()
                    .success(function (data) {
                        $scope.scrumMasterR = Underscore.where(data, {name: "ScrumMaster"});
                        $scope.teamMemberR = Underscore.where(data, {name: "TeamMember"});
                        $scope.productOwnerR = Underscore.where(data, {name: "ProductOwner"});
                    });
            };


            $scope.createTeam = function (team, productOwner, scrumMaster, members) {
                $scope.getRoles();
                //creating team
                TeamService.createTeam(team)
                    .success(function (data) {
                        var newPO =
                            {
                                "team": data.id,
                                "user": productOwner.id,
                                "is_active": true
                            },
                            newSM =
                            {
                                "team": data.id,
                                "user": scrumMaster.id,
                                "is_active": true
                            };
                        $scope.createUserTeamPromise = TeamService.createUserTeam(newPO)
                            .success(function (data) {
                                newRoleTeam =
                                    {
                                        "user_team": data.id,
                                        "role": $scope.productOwnerR[0].id
                                    };
                                $scope.userteamPO = data;
                                TeamService.createRoleTeam(newRoleTeam);
                                if (scrumMaster === productOwner) {
                                    newRoleTeam =
                                        {
                                            "user_team": data.id,
                                            "role": $scope.scrumMasterR[0].id
                                        };
                                    $scope.userteamSM = data;
                                    TeamService.createRoleTeam(newRoleTeam);
                                }
                                if (scrumMaster !== productOwner) {
                                    TeamService.createUserTeam(newSM)
                                        .success(function (data) {
                                            newRoleTeam =
                                                {
                                                    "user_team": data.id,
                                                    "role": $scope.scrumMasterR[0].id
                                                };
                                            $scope.userteamSM = data;
                                            TeamService.createRoleTeam(newRoleTeam);
                                        });
                                }
                            });

                        $scope.createUserTeamPromise.then(function () {
                            var i = 0;
                            for (i = 0; i < members.length; i = i + 1) {
                                if (members[i] !== scrumMaster && members[i] !== productOwner) {
                                    TeamService.createUserTeam(newPO)
                                        .success(function (data) {
                                            newRoleTeamTeamMember =
                                                {
                                                    "user_team": data.id,
                                                    "role": $scope.teamMemberR[0].id
                                                };
                                            TeamService.createRoleTeam(newRoleTeamTeamMember);
                                        });
                                } else {
                                    if (members[i] === scrumMaster) {
                                        newRoleTeamTeamMember =
                                            {
                                                "user_team": $scope.userteamSM.id,
                                                "role": $scope.teamMemberR[0].id
                                            };
                                    } else {
                                        newRoleTeamTeamMember =
                                            {
                                                "user_team": $scope.userteamPO.id,
                                                "role": $scope.teamMemberR[0].id
                                            };
                                    }
                                    TeamService.createRoleTeam(newRoleTeamTeamMember);
                                }
                            }
                        });
                    });
            };

            $scope.getGroups = function () {
                UserService.getUsers()
                    .success(function (data) {
                        $scope.scrumMasters = Underscore.filter(data, function (d) {return Underscore.where(d.groups, {'name': 'ScrumMaster'}).length > 0; });
                        $scope.teamMembers = Underscore.filter(data, function (d) {return Underscore.where(d.groups, {'name': 'TeamMember'}).length > 0; });
                        $scope.productOwners = Underscore.filter(data, function (d) {return Underscore.where(d.groups, {'name': 'ProductOwner'}).length > 0; });
                    });
            };
            $scope.getGroups();
        }]);
}());