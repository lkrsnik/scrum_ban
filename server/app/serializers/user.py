from app.models import Board
from django.db import models
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
            'first_name', 'last_name', 'password',
            'username', 'email', 'is_staff', 'groups', )
        read_only_fields = ('id', 'url', )
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        # for user registration password
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        new_password = validated_data.get('password')
        if new_password is not None:
            instance.set_password(new_password)

        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name',
                                                 instance.first_name)
        instance.last_name = validated_data.get('last_name',
                                                instance.last_name)
        instance.save()
        return instance
