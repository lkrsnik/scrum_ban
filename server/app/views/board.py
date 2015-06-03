from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.board import BoardSerializer, ColumnSerializer, \
                                    CardSerializer
from app.models import Board, Column, Card, Project, UserTeam, Team


class BoardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = BoardSerializer
    queryset = Board.objects.all()

    def list(self, request, pk=None):
        userTeamQS = UserTeam.objects.filter(user=request.user)
        projectQS = Project.objects.filter(team__in=userTeamQS.values('team'))
        boardQS = Board.objects.filter(id__in=projectQS.values('board'))
        serializer = self.serializer_class(boardQS, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
