/*global angular */
(function () {
    'use strict';

    // Declare app level module which depends on views, and components
    angular.module('scrumBan')
        .constant('ROLES', [
            {
                displayName: 'Administrator',
                id: 'administrator'
            },
            {
                displayName: 'Scrum master',
                id: 'scrummaster'
            },
            {
                displayName: 'Product owner',
                id: 'productowner'
            },
            {
                displayName: 'Team member',
                id: 'teammember'
            }
        ])
        .constant('USERS', [
            {
                id: 0,
                firstName: 'Rok',
                lastName: 'Rupnik',
                email: 'rok7rupnik@gmail.com',
                roles: ['teammember']
            },
            {
                id: 1,
                firstName: 'Luka',
                lastName: 'Krsnik',
                email: 'krsnik.luka92@gmail.com',
                roles: ['scrummaster']
            },
            {
                id: 2,
                firstName: 'Tone',
                lastName: 'Priimek',
                email: 'tone.primek@gmail.com',
                roles: ['productowner']
            }
        ])
        .constant('COL_DIM', {
            'width': 250,
            'narrowWidth': 50,
            'height': 700,
            'headerHeight': 40
        })
        .constant('API_URL', 'api/')
        .constant('DOCS', [{
            title : 'Users',
            is_staff: true,
            chapters: [
                {
                    header: 'Create user',
                    content: 'This is how you create a user.'
                },
                {
                    header: 'List users',
                    content: 'Here you can list all users, view and edit their information. You can also deactivate a certain user.'
                }]
        }, {
            title : 'Boards',
            roles: ['ScrumMaster', 'ProductOwner', 'TeamMember'],
            chapters: [
                {
                    header: 'Create board',
                    roles: ['ScrumMaster'],
                    content: "Here you can create a new board by entering it's name. You can also copy another board's structure by selecting another board from dropdown menu."
                },
                {
                    header: 'My boards',
                    content: "This is a view of all the boards with your team's projects and all the boards with no projects on them. The latter are listed to enable a scrum master user to even add projects to newly created boards."
                },
                {
                    header: 'Create card',
                    roles: ['ScrumMaster', 'ProductOwner'],
                    content: "Here you can create a new card. As Scrum Master you can only create silverbullet card, which is automatic moved to high priority column. You can not create silverbullet if there is already one in the high priority column. As Product Owner you can create cards with new functionality. They are moved to lefmost column. When you ae creating new card, first you must choose appropriate project, then you must enter card name, card content and optionally you can add deadline and responsible user."
                },
                {
                    header: 'Create column',
                    roles: ['ScrumMaster', 'ProductOwner'],
                    content: "Here you can create a new column. To have a valid board you must add two border columns and one column on the left side of left border column. This column is then marked as high priority column. You can create a column inside column if you choose a parent column. You can set the WIP value which will set limitation warnings if the number of cards in one column will be higher then the value you choose."
                }]
        }, {
            title : 'Login',
            roles: ['ScrumMaster', 'ProductOwner', 'TeamMember'],
            chapters: [
                {
                    header: 'Login',
                    content: "Login is easy. Enter your username and password. If you have forgotten your password contact admin. After 3 wrong input your IP will be locked for some time."
                }]
        }, {
            title : 'Projects',
            roles: ['ScrumMaster'],
            chapters: [
                {
                    header: 'Create project',
                    roles: ['ScrumMaster'],
                    content: "Here you can create project. Enter code, name, contracting authority, start date of project, end date of project and select developer team. All inputs are required. Start date must be today or before today and end date must be after start date."
                },
                {
                    header: 'List project',
                    roles: ['ScrumMaster'],
                    content: "All projects are listed here. You can view details about projects and edit every project data."
                }
            ]
        }, {
            title : 'Teams',
            roles: ['ScrumMaster'],
            chapters: [
                {
                    header: 'Create team',
                    content: "Create a team by entering it's name, selecting a product owner, scrum master and team members."
                },
                {
                    header: 'List teams',
                    content: 'All teams are listed here. You can view details about users activity and edit every team structure.'
                }]
        }]);
}());