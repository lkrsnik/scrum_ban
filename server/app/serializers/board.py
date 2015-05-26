from app.models import Board, Column
from django.db import models
from rest_framework import serializers


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ('id', 'name')
        read_only_fields = ('id',)


class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ('id', 'wip', 'location', 'parent_column', 'board',
                  'is_border', 'is_high_priority', 'acceptance_test')
        read_only_fields = ('id',)
