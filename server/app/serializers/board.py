from app.models import Board, Column, Card, Move
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
        fields = ('id', 'name', 'wip', 'location', 'parent_column', 'board',
                  'is_border', 'is_high_priority', 'acceptance_test')
        read_only_fields = ('id',)


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ('id', 'type', 'name', 'content', 'creation_date',
                  'completion_date', 'development_start_date', 'is_active',
                  'column', 'project', 'user')
        read_only_fields = ('id',)

class MoveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Move
        fields = ('id', 'date', 'is_legal', 'description', 'card',
                  'user', 'from_position')
        read_only_fields = ('id',)
