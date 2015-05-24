from app.models import Board
from django.db import models
from rest_framework import serializers


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ('id', 'user', 'team', 'is_active')
        read_only_fields = ('id', )
