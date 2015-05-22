/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('EditTeamCtrl',
        ['$scope', 'TeamService', 'UserService', '$routeParams', function ($scope, TeamService, UserService, $routeParams) {
            
            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }

            var team = null;           

            $scope.roleNames = {};
            $scope.scrumMasters = {};
            $scope.teamMembers = {};
            $scope.productOwners = {};
            $scope.userteamSM = null;
            $scope.userteamPO = null;
            var newRoleTeam, newRoleTeamTeamMember, createRoleTeamPromise, createFirstRoleTeamPromise, createSecondUserTeamPromise;


            $scope.getTeam = function () {
                TeamService.getTeam($routeParams.teamId)
                    .success(function (data) {
                        team = data;
                        $scope.team = team;
                        TeamService.getUserTeams()
                            .success(function (data) {
                                $scope.userTeams = data;
                                $scope.userTeams = Underscore.filter(data, function(userTeam) { return (userTeam.team == $scope.team.id && userTeam.is_active) });
                                TeamService.getRoleTeams()
                                    .success(function (data) {
                                        $scope.roleTeams = data;
                                        $scope.roleTeams = Underscore.filter(data, function(roleTeam) { return Underscore.where($scope.userTeams, {'id': roleTeam.user_team}).length > 0; });
                                        // update selections in form
                                        var selectedTM = [];
                                        for (var i = 0; i < $scope.roleTeams.length; i++) {
                                            if ($scope.roleTeams[i].role == $scope.roleNames["ScrumMaster"]) {
                                                $scope.scrumMaster = Underscore.find($scope.scrumMasters, function (sm) {
                                                    return Underscore.where($scope.userTeams, {'user': sm.id});
                                                });
                                            } else if ($scope.roleTeams[i].role == $scope.roleNames["ProductOwner"]) {
                                                $scope.productOwner = Underscore.find($scope.productOwners, function (sm) {
                                                    return Underscore.where($scope.userTeams, {'user': sm.id});
                                                });
                                            } else {
                                                selectedTM.push(Underscore.find($scope.teamMembers, function (sm) {
                                                    return Underscore.where($scope.userTeams, {'user': sm.id});
                                                }));
                                            }
                                        };
                                        $scope.teamMembersS = selectedTM;
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
                        $scope.getTeam();
                    });
            };
            $scope.getGroups();
            


            $scope.getRoles = function () {
                UserService.getGroups() 
                    .success(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            $scope.roleNames[data[i].name] = data[i].id;
                        };
                        $scope.scrumMasterR = Underscore.where(data, {name: "ScrumMaster"});
                        $scope.teamMemberR = Underscore.where(data, {name: "TeamMember"});
                        $scope.productOwnerR = Underscore.where(data, {name: "ProductOwner"});
                    });
            };
            $scope.getRoles();

            $scope.editTeam = function (team, productOwner, scrumMaster, members) {
                // najdi razlike v memberjih
                // izpiši, kaj boš naredil ??
                // upadate team
                // update roleTeam - deaktiviraj roleteame
                // create nov userTeam
                // create nov roleTeam
            }

            $scope.createTeam = function (team, productOwner, scrumMaster, members) {
                $scope.getRoles();
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
                                        });
                                    });
                            });
                    });
            };

           
        }]);
}());