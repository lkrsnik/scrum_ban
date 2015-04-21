/*global describe, module, beforeEach, inject, it, expect */
describe('CreateUserCtrl', function () {
    'use strict';

    beforeEach(module('scrumBan'));

    var CreateUserCtrl,
        scope,
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
        scope = $rootScope.$new();
        // backend definition common for all tests
        $httpBackend.when('GET', 'api/groups')
                    .respond(groups);
        CreateUserCtrl = $controller('CreateUserCtrl', {
            $scope: scope
        });
    }));
    it('should load correct groups', function () {
        scope.getGroups();
        expect(scope.groups).toEqual(groups);
    });

});