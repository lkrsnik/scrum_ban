from django.contrib.auth.models import User, Group
from app.models import Team
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers import UserSerializer, GroupSerializer, TeamSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def create(self, request):
        serializer = self.get_serializer(data=request.DATA)
        if serializer.is_valid():
            group_id = request.DATA['group']
            group = Group.objects.filter(id=group_id)
            if len(group)!=1:
                return Response({ 'detail': 'No group with id:' + str(group_id) },\
                    status=status.HTTP_400_BAD_REQUEST)
            serializer.object.groups = group
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    def list(self, request, pk=None):
        """
        Get method for retrieving all users 
        """
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def list(self, request, pk=None):
        """
        Get method for retrieving all groups 
        """
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TeamViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = TeamSerializer
    queryset = Team.objects.all()

    
