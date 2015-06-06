from rest_framework import permissions


class IsStaffOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # allow if logged in user is in Admin group
        return view.action == 'retrieve' or view.action == 'update' or \
            request.user.is_staff


class IsStaffOrScrumMasterGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        # allow if logged in user is in ScrumMaster group
        return view.action == 'retrieve' or view.action == 'update' or \
            request.user.is_staff or \
            'ScrumMaster' in [g.name for g in request.user.groups.all()]
