from app.models import Team, RoleTeam, UserTeam, RoleTeam, UserTeamActivity
from rest_framework import serializers

class TeamSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name')
        read_only_fields = ('id', )


class UserTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTeam
        fields = ('id', 'user', 'team', 'is_active')
        read_only_fields = ('id', )


class RoleTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleTeam
        fields = ('id', 'user_team', 'role')
        read_only_fields = ('id', )

class UserTeamActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTeamActivity
        fields = ('id', 'user', 'team', 'date', 'activated')
        read_only_fields = ('id', )
