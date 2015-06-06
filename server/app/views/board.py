from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from app.serializers.board import BoardSerializer, ColumnSerializer, \
                                  CardSerializer, MoveSerializer
from app.models import Board, Column, Card, Project, UserTeam, Team, \
                       Group, Move


class BoardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows boards to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = BoardSerializer
    queryset = Board.objects.all()

    def list(self, request, pk=None):
        if (request.user.is_staff):
            queryset = Board.objects.all()
            serializer = self.serializer_class(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        userTeamQS = UserTeam.objects.filter(user=request.user)
        projectQS = Project.objects.filter(team__in=userTeamQS.values('team'))
        boardQS = Board.objects.filter(id__in=projectQS.values('board'))
        serializer = self.serializer_class(boardQS, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ColumnViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows columns to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ColumnSerializer
    queryset = Column.objects.all()

    def list(self, request, pk=None):
        columnQS = Column.objects.filter(board=request.QUERY_PARAMS['boardId'])
        serializer = self.serializer_class(columnQS, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows cards to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = CardSerializer
    queryset = Card.objects.all()


class MoveViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MoveSerializer
    queryset = Move.objects.all()
