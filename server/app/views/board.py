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

        # Get all projects and their boards
        allProjectsQS = Project.objects.all()
        notNullBoardsQS = \
            Board.objects.filter(id__in=allProjectsQS.values('board'))

        # Get all boards
        allBoardsQS = Board.objects.all()

        # Null boards are diff between second and first set
        nullBoardsQS = allBoardsQS.exclude(id__in=notNullBoardsQS.values('id'))

        # Get user boards
        userTeamQS = UserTeam.objects.filter(user=request.user)
        projectQS = Project.objects.filter(team__in=userTeamQS.values('team'))
        userBoardQS = Board.objects.filter(id__in=projectQS.values('board'))

        # Concatenate null boards with user boards
        boardQS = nullBoardsQS | userBoardQS
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

    def list(self, request, pk=None):
        if request.QUERY_PARAMS.get('deleted'):
            projectQS = Project.objects.filter(board=request.QUERY_PARAMS['boardId'])
            cardQS = Card.objects.filter(
                project__in=projectQS.values('id'),
                is_active=False)
            serializer = self.serializer_class(cardQS, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        if request.QUERY_PARAMS.get('boardId'):
            projectQS = Project.objects.filter(board=request.QUERY_PARAMS['boardId'])
            cardQS = Card.objects.filter(
                project__in=projectQS.values('id'),
                is_active=True)
            serializer = self.serializer_class(cardQS, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        queryset = Card.objects.filter(is_active=True)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MoveViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows teams to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MoveSerializer
    queryset = Move.objects.all()

    def list(self, request):
        if request.QUERY_PARAMS.get('cardId'):
            moveQS = Move.objects.filter(card=request.QUERY_PARAMS['cardId'])
            serializer = self.serializer_class(moveQS, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        queryset = Move.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
