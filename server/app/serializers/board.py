from app.models import Board
from django.db import models
from rest_framework import serializers


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ('id', 'name')
        read_only_fields = ('id',)
