from django.contrib.auth.models import User, Group
from django.test import RequestFactory
from app.models import Team, RoleTeam, UserTeam, RoleTeam, Project, UserTeamActivity
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.team import TeamSerializer, UserTeamSerializer, RoleTeamSerializer, UserTeamActivitySerializer

class TeamViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = TeamSerializer
    queryset = Team.objects.all()


class UserTeamViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserTeamSerializer
    queryset = UserTeam.objects.all()

    def create(self, request):
        serializer = self.get_serializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleTeamViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = RoleTeamSerializer
    queryset = RoleTeam.objects.all()

    def create(self, request):
        serializer = self.get_serializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, pk=None):
        if request.QUERY_PARAMS.get('teamId'):
            userTeamQS = UserTeam.objects.filter(team=request.QUERY_PARAMS['teamId'], 
                                    user=request.user)
            roleTeamQS = RoleTeam.objects.filter(user_team__in=userTeamQS.values('id'))
            serializer = self.serializer_class(roleTeamQS, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        queryset = RoleTeam.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserTeamActivityViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserTeamActivitySerializer
    queryset = UserTeamActivity.objects.all()

    def create(self, request):
        serializer = self.get_serializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)