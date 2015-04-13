/*global angular */
(function () {
    'use strict';

    // Declare app level module which depends on views, and components
    angular.module('scrumBan')
        .constant('ROLES', [
            {
                displayName: 'Administrator',
                id: 'Administrator'
            },
            {
                displayName: 'Spremljevalec',
                id: 'scrummaster'
            },
            {
                displayName: 'Voditelj',
                id: 'Leader'
            },
            {
                displayName: 'Član',
                id: 'Participant'
            },
            {
                displayName: 'Udeleženec',
                id: 'Member'
            }
        ]);
}());