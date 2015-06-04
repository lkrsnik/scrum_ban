from app.models import Project
from rest_framework import serializers

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'code', 'name', 'client', 'start_date', 'end_date', 'board', 'team', 'is_active')
        read_only_fields = ('id', )