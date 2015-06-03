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
        #Data preparation
        userTeamQS = UserTeam.objects.filter(user = request.user)
        #teamQS = Team.objects.filter(id__in = userTeamQS.values('team'))
        projectQS = Project.objects.filter(team__in = userTeamQS.values('team'))
        boardQS = Board.objects.filter(id__in = projectQS.values('board'))
        print ("userTeamQS", userTeamQS)
        #print ("values", userTeamQS.values('team'))
        #print ("userTeamQS.name", userTeamQS.team.all())
        #print ("teamQS", teamQS[2].name)
        #print ("boardQS", boardQS[2].name)
        #queryset = Project.objects.filter(team__ = 'Leader')
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
