from rest_framework import permissions

class IsAdminGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        # allow if logged in user is in Admin group
        return view.action == 'retrieve' or view.action == 'update' or 'Admin' in [g.name for g in request.user.groups.all()]

class IsAdminOrScrumMasterGroup(permissions.BasePermission): 
    def has_permission(self, request, view):
        # allow if logged in user is in ScrumMaster group 
        return view.action == 'retrieve' or view.action == 'update' or 'Admin' in [g.name for g in request.user.groups.all()] or 'ScrumMaster' in [g.name for g in request.user.groups.all()]
        