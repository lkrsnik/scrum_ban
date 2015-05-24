from django.test import RequestFactory
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.user import UserSerializer


class SessionViewSet(viewsets.ViewSet):
    def list(self, request, pk=None):
        roamingUser = request.user
        if (permissions.IsAuthenticated
                .has_permission(self, request, SessionViewSet)):
            # you need to generate a fake request for hyperlinked results
            context = dict(request=RequestFactory().get('/'))
            serializer = UserSerializer(request.user, context=context)
        else:
            JSON = {}
            JSON['authenticated'] = False
            return Response(JSON, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)
