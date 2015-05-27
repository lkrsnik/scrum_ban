/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('EditTeamCtrl',
        ['$scope', '$q', 'TeamService', 'UserService', '$routeParams',  '$location', function ($scope, $q, TeamService, UserService, $routeParams, $location) {

            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }

            $scope.roleNames = {};
            $scope.scrumMasters = {};
            $scope.teamMembers = {};
            $scope.productOwners = {};
            $scope.userteamSM = null;
            $scope.userteamPO = null;
            $scope.previousSelectedTM = null;
            $scope.previousSelectedSM = null;
            $scope.previousSelectedPO = null;
            $scope.uTeams = null;
            $scope.rTeams = null;
            var team = null,
                newRoleTeam,
                newRoleTeamTeamMember,
                createRoleTeamPromise,
                createFirstRoleTeamPromise,
                createSecondUserTeamPromise;

            $scope.getTeam = function () {
                TeamService.getTeam($routeParams.teamId)
                    .success(function (data) {
                        team = data;
                        $scope.team = team;
                        TeamService.getUserTeams()
                            .success(function (data) {
                                $scope.userTeams = data;
                                $scope.uTeams = data;
                                $scope.userTeams = Underscore.filter(data, function (userTeam) {
                                    return (userTeam.team === $scope.team.id && userTeam.is_active);
                                });
                                $scope.uTeams = Underscore.filter(data, function (userTeam) {
                                    return (userTeam.team === $scope.team.id);
                                });
                                TeamService.getRoleTeams()
                                    .success(function (data) {
                                        $scope.roleTeams = data;
                                        $scope.roleTeams = Underscore.filter(data, function (roleTeam) {
                                            return Underscore.where($scope.userTeams, {'id': roleTeam.user_team}).length > 0;
                                        });
                                        $scope.rTeams = $scope.roleTeams;
                                        // update selections in form
                                        var selectedTM = [],
                                            scrumMasterFindFun = function (sm) {
                                                return Underscore.where($scope.userTeams, {'user': sm.id});
                                            },
                                            productOwnerFindFun = function (sm) {
                                                return Underscore.where($scope.userTeams, {'user': sm.id});
                                            },
                                            i;
                                        for (i = 0; i < $scope.roleTeams.length; i += 1) {
                                            if ($scope.roleTeams[i].role === $scope.roleNames.ScrumMaster) {
                                                $scope.scrumMaster = Underscore.find($scope.scrumMasters, scrumMasterFindFun);
                                            } else if ($scope.roleTeams[i].role === $scope.roleNames.ProductOwner) {
                                                $scope.productOwner = Underscore.find($scope.productOwners, productOwnerFindFun);
                                            }
                                        }
                                        selectedTM = Underscore.filter($scope.teamMembers, function (tm) {
                                            return Underscore.where($scope.userTeams, {'user': tm.id}).length > 0;
                                        });
                                        $scope.previousSelectedSM = $scope.scrumMaster;
                                        $scope.previousSelectedPO = $scope.productOwner;
                                        $scope.previousSelectedTM = selectedTM;
                                        $scope.teamMembersS = selectedTM;
                                    });
                            });
                    });
            };
            $scope.getGroups = function () {
                UserService.getUsers()
                    .success(function (data) {
                        $scope.scrumMasters = Underscore.filter(data, function (d) {return Underscore.contains(d.groups, 'ScrumMaster'); });
                        $scope.teamMembers = Underscore.filter(data, function (d) {return Underscore.contains(d.groups, 'TeamMember'); });
                        $scope.productOwners = Underscore.filter(data, function (d) {return Underscore.contains(d.groups, 'ProductOwner'); });
                        $scope.getTeam();
                    });
            };
            $scope.getGroups();

            $scope.getRoles = function () {
                UserService.getGroups()
                    .success(function (data) {
                        var i;
                        for (i = 0; i < data.length; i += 1) {
                            $scope.roleNames[data[i].name] = data[i].id;
                        }
                        $scope.scrumMasterR = Underscore.where(data, {name: "ScrumMaster"});
                        $scope.teamMemberR = Underscore.where(data, {name: "TeamMember"});
                        $scope.productOwnerR = Underscore.where(data, {name: "ProductOwner"});
                    });
            };
            $scope.getRoles();

            $scope.editTeam = function (team, productOwner, scrumMaster, members) {
                $scope.getRoles();
                TeamService.updateTeam(team)
                    .success(function () {
                        var i = 0,
                            completedRT = [],
                            completedUT = [];
                        for (i = 0; i < $scope.rTeams.length; i = i + 1) {
                            completedRT.push(TeamService.deleteRoleTeam($scope.rTeams[i]));
                        }
                        $q.all(completedRT).then(function () {
                            for (i = 0; i < $scope.uTeams.length; i = i + 1) {
                                completedUT.push(TeamService.deleteUserTeam($scope.uTeams[i]));
                            }
                            $q.all(completedUT).then(function () {
                                var newPO =
                                    {
                                        "team": team.id,
                                        "user": productOwner.id,
                                        "is_active": true
                                    },
                                    newSM =
                                    {
                                        "team": team.id,
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
                                                            var newTM,
                                                                created = [],
                                                                createUserTeamSuccessFun = function (data) {
                                                                    newRoleTeamTeamMember =
                                                                        {
                                                                            "user_team": data.id,
                                                                            "role": $scope.teamMemberR[0].id
                                                                        };
                                                                    created.push(TeamService.createRoleTeam(newRoleTeamTeamMember));
                                                                };
                                                            for (i = 0; i < members.length; i = i + 1) {
                                                                if (members[i] !== scrumMaster && members[i] !== productOwner) {
                                                                    newTM =
                                                                        {
                                                                            "team": team.id,
                                                                            "user": members[i].id,
                                                                            "is_active": true
                                                                        };
                                                                    TeamService.createUserTeam(newTM)
                                                                        .success(createUserTeamSuccessFun);
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
                                                                    created.push(TeamService.createRoleTeam(newRoleTeamTeamMember));
                                                                }
                                                            }
                                                            $q.all(created).then(function () {
                                                                $location.path('/teams/');
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                    });
                            });
                        });
                    });
            };
        }]);
}());