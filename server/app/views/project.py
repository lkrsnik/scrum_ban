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

    def list(self, request):
        if request.QUERY_PARAMS.get('boardId'):
            if request.QUERY_PARAMS.get('role'):
                groupQS = Group.objects.filter(name = request.QUERY_PARAMS['role'] )
                roleTeamQS = RoleTeam.objects.filter(role__in=groupQS.values('id'));
                userTeamQS = UserTeam.objects.filter(user=request.user, id__in=roleTeamQS.values('user_team'))
            else:
                userTeamQS = UserTeam.objects.filter(user=request.user)
            projectQS = Project.objects.filter(board=request.QUERY_PARAMS['boardId'], 
                                    team__in=userTeamQS.values('team'))
            serializer = self.serializer_class(projectQS, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        queryset = Project.objects.all() 
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)