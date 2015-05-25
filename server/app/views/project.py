from django.contrib.auth.models import User, Group
from django.test import RequestFactory
from app.models import Team, RoleTeam, UserTeam, RoleTeam, Project
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.project import  ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

    def create(self, request):
        serializer = self.get_serializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)