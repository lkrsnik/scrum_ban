from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.board import BoardSerializer
from app.models import Board


class BoardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = BoardSerializer
    queryset = Board.objects.all()
