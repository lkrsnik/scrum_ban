/*global describe, module, beforeEach, inject, it, expect */
describe('CreateUserCtrl', function () {
    'use strict';

    beforeEach(module('scrumBan'));

    var CreateUserCtrl,
        scope,
        httpBackend,
        groups = [
            {
                "id": 5,
                "url": "http://localhost:8000/api/groups/5/",
                "name": "ProductOwner"
            },
            {
                "id": 4,
                "url": "http://localhost:8000/api/groups/4/",
                "name": "ScrumMaster"
            },
            {
                "id": 6,
                "url": "http://localhost:8000/api/groups/6/",
                "name": "TeamMember"
            }
        ];

    beforeEach(inject(function ($httpBackend, $rootScope, $controller) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        // backend definition common for all tests
        $httpBackend.when('GET', 'api/groups/')
                    .respond(groups);
        CreateUserCtrl = $controller('CreateUserCtrl', {
            $scope: scope
        }); 

    }));
    /*
    afterEach(function(){ 
        // This asserts that all requests have been flushed to the API.
        // When not, this function throws an exception
        httpBackend.verifyNoOutstandingExpectation();  
        httpBackend.verifyNoOutstandingRequest();
    }); */
    it('should load correct groups', function () {
        scope.getGroups();
        // flush all request to API - synchronous mode
        httpBackend.flush();
        
        expect(scope.groups).toEqual(groups);
    });

});