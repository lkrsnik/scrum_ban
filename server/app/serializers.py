from django.contrib.auth.models import User, Group
from app.models import Team
from rest_framework import serializers


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'url', 'name')
        read_only_fields = ('id', 'url',)

class UserSerializer(serializers.HyperlinkedModelSerializer):
    groups = GroupSerializer(many=True)
    class Meta:
        model = User
        fields = ('id', 'url', 'first_name', 'last_name', 'username', 'email', 'groups')
        read_only_fields = ('id', 'url',)


class TeamSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name')
        read_only_fields = ('id')

# example
"""
class UserForCongregationSerializer(serializers.HyperlinkedModelSerializer):
    user_congregations = User_CongregationSerializer(many=True)
    class Meta:
        model = User
        fields = ('user_congregations',)

class ApplicationListSerializer(serializers.HyperlinkedModelSerializer):
    user_username = serializers.Field(source='user_id.username')
    user_email = serializers.Field(source='user_id.email')
    user_id = UserForCongregationSerializer()
    cycle_id = serializers.Field(source='cycle_id.id')
    class Meta:
        model = Application
        fields = ('id', 'user_username', 'user_email', 'cycle_id', 'status', 'applied_date', 'user_id')
        read_only_fields = ('id',)
"""