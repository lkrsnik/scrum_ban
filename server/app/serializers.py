from django.contrib.auth.models import User, Group
from app.models import Team, RoleTeam, UserTeam, RoleTeam, Project
from rest_framework import serializers

from django.shortcuts import render


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'url', 'name')
        read_only_fields = ('id', 'url',)


class UserSerializer(serializers.HyperlinkedModelSerializer):
    groups = GroupSerializer(many=True)

    class Meta:
        model = User
        fields = ('id', 'url', 'first_name', 'last_name', 'username',
                        'email', 'groups')
        read_only_fields = ('id', 'url',)


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

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'code', 'name', 'client', 'start_date', 'end_date', 'board', 'team')
        read_only_fields = ('id', )


