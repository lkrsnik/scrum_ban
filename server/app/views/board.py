from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.board import BoardSerializer, ColumnSerializer, \
                                    CardSerializer
from app.models import Board, Column, Card


class BoardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = BoardSerializer
    queryset = Board.objects.all()


class ColumnViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ColumnSerializer
    queryset = Column.objects.all()


class CardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CardSerializer
    queryset = Card.objects.all()
