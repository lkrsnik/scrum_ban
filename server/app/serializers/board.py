from app.models import Board, Column, Card, Move, WipViolation
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
                  'completion_date', 'development_start_date', 'done_date',
                  'is_active', 'column', 'project', 'user', 'story_points')
        read_only_fields = ('id',)


class MoveSerializer(serializers.ModelSerializer):
    # under user return first_name
    user_first_name = serializers.ReadOnlyField(source='user.first_name')
    from_position_name = serializers.ReadOnlyField(source='from_position.name')
    to_position_name = serializers.ReadOnlyField(source='to_position.name')
    class Meta:
        model = Move
        fields = ('id', 'date', 'is_legal', 'description', 'card',
                  'user', 'from_position', 'to_position', 'user_first_name',
                  'from_position_name', 'to_position_name')
        read_only_fields = ('id', 'user_first_name')

class WipViolationSerializer(serializers.ModelSerializer):
    # under user return first_name
    user_first_name = serializers.ReadOnlyField(source='user.first_name')
    column_name = serializers.ReadOnlyField(source='column.name')
    class Meta:
        model = WipViolation
        fields = ('id', 'date', 'card', 'user', 'column', 'user_first_name',
                  'column_name')
        read_only_fields = ('id', 'user_first_name')
