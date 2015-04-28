from django.contrib import admin
from app.models import Team, UserTeam, Board, Project, Column, \
    RoleTeam, Move, Task, Permission

admin.site.register(Team)
admin.site.register(UserTeam)
admin.site.register(Board)
admin.site.register(Project)
admin.site.register(Column)
admin.site.register(RoleTeam)
admin.site.register(Move)
admin.site.register(Task)
admin.site.register(Permission)
