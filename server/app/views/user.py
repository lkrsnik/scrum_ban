from django.contrib.auth.models import User, Group
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.user import UserSerializer, GroupSerializer
from app.permissions import IsAdminGroup, IsAdminOrScrumMasterGroup


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (IsAdminOrScrumMasterGroup,)
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def create(self, request):
        user_groups = request.DATA.pop('groups')
        request.DATA['groups'] = []
        print(request.DATA)
        serializer = self.get_serializer(data=request.DATA)
        if serializer.is_valid():
            user = serializer.save()

            for group in user_groups:
                g = Group.objects.get(id=group['id'])
                g.user_set.add(user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, pk=None):
        """
        Get method for retrieving all users
        """
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, pk=None):
        """
        Updates a single user with specified id
        """
        user = User.objects.filter(id=pk)
        if len(user) > 0:
            user_obj = user.first()  # user object
            user_data = request.DATA  # user data as dictionary
            serializer = self.get_serializer(user_obj, data=user_data)
            if serializer.is_valid():
                user = serializer.save()

                for group in Group.objects.all():
                    group.user_set.remove(user)

                user_groups = request.DATA.pop('groups')
                print(user_groups)
                for group in user_groups:
                    g = Group.objects.get(name=group)
                    g.user_set.add(user)
            else:
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(
                {'error': 'No user with id: ' + str(pk)},
                status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_200_OK)


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
