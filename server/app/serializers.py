from django.contrib.auth.models import User, Group
from rest_framework import serializers


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'url', 'name')
        read_only_fields = ('id', 'url',)


class UserSerializer(serializers.HyperlinkedModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = User
        fields = (
            'id', 'url', 'is_active',
            'first_name', 'last_name',
            'username', 'email', 'groups',)
        read_only_fields = ('id', 'url', )
