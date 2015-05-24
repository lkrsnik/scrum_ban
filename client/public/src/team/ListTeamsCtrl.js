/*global angular, console, Underscore */
(function () {
    'use strict';
    angular.module('scrumBan').controller('ListTeamsCtrl',
        ['$scope', 'TeamService', 'UserService', function ($scope, TeamService, UserService) {

            if (!$scope.session) {
                $scope.updateSessionView()
                    .then(function () {
                        $scope.redirectNonScrumMaster('/');
                    });
            } else {
                $scope.redirectNonScrumMaster('/');
            }
            var scteams = null;
            //map of role id => role name
            $scope.roleNames = {};
            //console.log('List teams');
            $scope.getTeams = function () {
                TeamService.getTeams()
                    .success(function (data) {
                        console.log(data);
                        scteams = data;
                        //$scope.users = Underscore.filter(data, function (user) { return user.is_active; });
                        $scope.getUserTeams();

                    });
            };

            $scope.getUserTeams = function () {
                TeamService.getUserTeams()
                    .success(function (data) {
                        $scope.userTeams = data;
                        //if($scope.session.username !== "admin") {
                            //$scope.userTeams = Underscore.filter(data, function(userTeam) { return userTeam.user == $scope.session.userid});
                        console.log($scope.userTeams);
                        $scope.getRoleTeams();
                        //}
                    });
            };

            $scope.getRoleTeams = function () {
                TeamService.getRoleTeams()
                    .success(function (data) {
                        var i,
                            roleTeamsFindFun = function (roleTeam) {
                                return roleTeam.user_team === $scope.userTeams[i].id;
                            };
                        $scope.roleTeams = data;
                       // $scope.roleTeams = Underscore.filter(data, function(roleTeam) {                                                   
                        //                                                return Underscore.where($scope.userTeams, {'id': roleTeam.user_team}).length > 0; });
                        console.log($scope.roleTeams);

                        //merge userTeams with roles
                        for (i = 0; i < $scope.userTeams.length; i += 1) {
                            // all roles for a specific user in a team
                            $scope.userTeams[i].roles = Underscore.filter($scope.roleTeams, roleTeamsFindFun);
                        }
                        // I don't know how to call an anysnchronous service in for loop, so I will just get all users
                        UserService.getUsers()
                            .success(function (data) {
                                var j, k,
                                    users, userTeams, user, teamPO, teamSM, teamMembers,
                                    findUserTeamsFun = function (userTeam) {
                                        return (userTeam.team === scteams[i].id && userTeam.is_active);
                                    },
                                    findUserFun = function (usr) {
                                        return usr.id === userTeams[j].user;
                                    };
                                users = data;
                                for (i = 0; i < scteams.length; i += 1) {
                                    // get only relevant userTeams for this team
                                    userTeams = Underscore.filter($scope.userTeams, findUserTeamsFun);
                                    teamPO = null;
                                    teamSM = null;
                                    teamMembers = [];
                                    // map each user to his role in a team according to collected data
                                    for (j = 0; j < userTeams.length; j += 1) {
                                        for (k = 0; k < userTeams[j].roles.length; k += 1) {
                                            user = Underscore.find(users, findUserFun);
                                            if ($scope.roleNames[userTeams[j].roles[k].role] === "ScrumMaster") {
                                                teamSM = user;
                                            } else if ($scope.roleNames[userTeams[j].roles[k].role] === "ProductOwner") {
                                                teamPO = user;
                                            } else {
                                                teamMembers.push(user);
                                            }
                                        }
                                    }
                                    scteams[i].productOwner = teamPO;
                                    scteams[i].scrumMaster = teamSM;
                                    scteams[i].teamMembers = teamMembers;
                                }
                                $scope.teams = scteams;
                                // if the user is not admin, show only those teams, which he is KanbanMaster in
                                if ($scope.session.username !== "admin") {
                                    Underscore.filter($scope.teams, function (team) {
                                        return team.scrumMaster.id === $scope.session.userid;
                                    });
                                }
                                console.log($scope.teams);
                            });
                    });
            };

            $scope.getRoles = function () {
                UserService.getGroups()
                    .success(function (data) {
                        var i;
                        for (i = 0; i < data.length; i += 1) {
                            $scope.roleNames[data[i].id] = data[i].name;
                        }
                        console.log($scope.roleNames);
                        $scope.getTeams();
                    });
            };
            $scope.getRoles();

            $scope.deleteUser = function (user) {
                user.is_active = false;
                UserService.updateUser(user);
            };

            $scope.activateUser = function (user) {
                user.is_active = true;
                UserService.updateUser(user);
            };
        }]);
}());