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

            

            $scope.getRoles = function () {
                console.log("kikikikik");
                UserService.getGroups()
                    .success(function (data) {
                        $scope.scrumMasterR = Underscore.where(data, {name: "ScrumMaster"});
                        $scope.teamMemberR = Underscore.where(data, {name: "TeamMember"});
                        $scope.productOwnerR = Underscore.where(data, {name: "ProductOwner"});
                        console.log("retrieved_ ");
                        console.log($scope.productOwnerR);
                        console.log($scope.scrumMasterR);
                        console.log($scope.teamMemberR);

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
                             "is_active": true,
                         };
                        var newSM = 
                         {
                             "team": data.id,
                             "user": scrumMaster.id,
                             "is_active": true,
                         };
                        $scope.createUserTeamPromise = TeamService.createUserTeam(newPO)
                            .success(function (data) {
                                var newRT = 
                                 {
                                     "user_team": data.id,
                                     "role": $scope.productOwnerR[0].id,
                                 };
                                 $scope.userteamPO = data;
                                  console.log($scope.userteamPO); 
                                 TeamService.createRoleTeam(newRT)
                                    .success(function (data) {
                                });
                                if(scrumMaster == productOwner){
                                    var newRT = 
                                     {
                                         "user_team": data.id,
                                         "role": $scope.scrumMasterR[0].id,
                                     };
                                     $scope.userteamSM = data;
                                     console.log($scope.userteamSM);                                    
                                     TeamService.createRoleTeam(newRT)
                                        .success(function (data) {
                                    });
                                }
                                if(scrumMaster != productOwner){                            
                                TeamService.createUserTeam(newSM)
                                    .success(function (data) {
                                        var newRT = 
                                         {
                                             "user_team": data.id,
                                             "role": $scope.scrumMasterR[0].id,
                                         }; 
                                         $scope.userteamSM = data; 
                                          console.log($scope.userteamSM);                                    
                                         TeamService.createRoleTeam(newRT)
                                            .success(function (data) {
                                        });
                            });
                        }
                        });
                        

                         $scope.createUserTeamPromise.then(function (data){  
                            for (var i = 0; i < members.length; i++) { 
                                if(members[i] != scrumMaster && members[i] != productOwner){
                                    TeamService.createUserTeam(newPO)
                                    .success(function (data) {
                                        var newM = 
                                         {
                                             "user_team": data.id,
                                             "role": $scope.teamMemberR[0].id,
                                         };
                                         TeamService.createRoleTeam(newM)
                                            .success(function (data) {
                                        });
                                });
                                }
                                else{
                                    if(members[i]== scrumMaster){
                                        console.log("here");
                                        var newM = 
                                         {
                                             "user_team": $scope.userteamSM.id,
                                             "role": $scope.teamMemberR[0].id,
                                         };
                                    }
                                    else{
                                        console.log("here2");
                                        var newM = 
                                         {
                                             "user_team": $scope.userteamPO.id,
                                             "role": $scope.teamMemberR[0].id,
                                         };
                                    }
                                    TeamService.createRoleTeam(newM)
                                            .success(function (data) {
                                        });

                                }
                            }
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