from django.contrib.auth.models import User, Group
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.user import UserSerializer, GroupSerializer
from app.permissions import IsStaffOrReadOnly, IsStaffOrScrumMasterGroup


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def create(self, request):
        user_groups = request.DATA.pop('groups')
        is_staff = False
        if 'is_staff' in request.DATA:
            is_staff = request.DATA.pop('is_staff')
        serializer = self.get_serializer(data=request.DATA)
        if serializer.is_valid():
            user = serializer.save()
            user.is_staff = is_staff
            user.save()
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
        user_groups = request.DATA.pop('groups')
        if len(user) > 0:
            user_obj = user.first()  # user object
            is_staff = user_obj.is_staff
            if 'is_staff' in request.DATA:
                is_staff = request.DATA.pop('is_staff')
            is_active = user_obj.is_active
            if 'is_active' in request.DATA:
                is_active = request.DATA.pop('is_active')
            user_data = request.DATA  # user data as dictionary
            serializer = self.get_serializer(user_obj, data=user_data)
            if serializer.is_valid():
                user = serializer.save()

                user.is_staff = is_staff
                user.is_active = is_active
                user.save()

                for group in Group.objects.all():
                    group.user_set.remove(user)
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
