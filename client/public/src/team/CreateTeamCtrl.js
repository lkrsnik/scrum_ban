/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('CreateTeamCtrl',
        ['$scope', 'TeamService', 'UserService', function ($scope, TeamService, UserService) {
            
            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }
            
            $scope.scrumMasters = {};
            $scope.teamMembers = {};
            $scope.productOwners = {};
            $scope.userteamSM = null;
            $scope.userteamPO = null;
            var newRoleTeam, newRoleTeamTeamMember, createRoleTeamPromise, createFirstRoleTeamPromise, createSecondUserTeamPromise;

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
                TeamService.createTeam(team)
                    .success(function (dataTeam) {
                        var newPO =
                            {
                                "team": dataTeam.id,
                                "user": productOwner.id,
                                "is_active": true
                            },
                            newSM =
                            {
                                "team": dataTeam.id,
                                "user": scrumMaster.id,
                                "is_active": true
                            };
                        TeamService.createUserTeam(newPO)
                            .success(function (data) {
                                newRoleTeam =
                                    {
                                        "user_team": data.id,
                                        "role": $scope.productOwnerR[0].id
                                    };
                                $scope.userteamPO = data;
                                createFirstRoleTeamPromise = TeamService.createRoleTeam(newRoleTeam)
                                    .success(function (data) {
                                        if (scrumMaster === productOwner) {
                                            newRoleTeam =
                                                {
                                                    "user_team": data.id,
                                                    "role": $scope.scrumMasterR[0].id
                                                };
                                            $scope.userteamSM = data;
                                            createSecondUserTeamPromise = createFirstRoleTeamPromise;
                                            createRoleTeamPromise = TeamService.createRoleTeam(newRoleTeam);

                                        } else {
                                            createSecondUserTeamPromise = TeamService.createUserTeam(newSM)
                                                .success(function (data) {
                                                    newRoleTeam =
                                                        {
                                                            "user_team": data.id,
                                                            "role": $scope.scrumMasterR[0].id
                                                        };
                                                    $scope.userteamSM = data;
                                                    createRoleTeamPromise = TeamService.createRoleTeam(newRoleTeam);
                                                });
                                        }
                                        createFirstRoleTeamPromise.then(function () {
                                            createSecondUserTeamPromise.then(function () {
                                                createRoleTeamPromise.then(function () {
                                                    var i = 0;
                                                    for (i = 0; i < members.length; i = i + 1) {
                                                        if (members[i] !== scrumMaster && members[i] !== productOwner) {
                                                            console.log("they're not equal")
                                                            var newTM =
                                                                {
                                                                    "team": dataTeam.id,
                                                                    "user": members[i].id,
                                                                    "is_active": true
                                                                };
                                                            TeamService.createUserTeam(newTM)
                                                                .success(function (data) {
                                                                    newRoleTeamTeamMember =
                                                                        {
                                                                            "user_team": data.id,
                                                                            "role": $scope.teamMemberR[0].id
                                                                        };
                                                                    TeamService.createRoleTeam(newRoleTeamTeamMember);
                                                                });
                                                        } else {
                                                            console.log("they equal")
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
                                        });
                                    });
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