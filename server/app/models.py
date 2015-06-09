from django.db import models
from django.contrib.auth.models import User, Group
from datetime import datetime
from decimal import Decimal


class LockIp(models.Model):
    faild_attempts = models.IntegerField()
    ip = models.CharField(max_length=100, default="")


class Team(models.Model):
    name = models.CharField(max_length=100, default="")


class UserTeam(models.Model):
    user = models.ForeignKey(User)
    team = models.ForeignKey(Team)
    is_active = models.BooleanField(default=True)


class UserTeamActivity(models.Model):
    user = models.ForeignKey(User)
    team = models.ForeignKey(Team)
    date = models.DateTimeField(default=datetime.now)
    activated = models.BooleanField(default=True)


class Board(models.Model):
    name = models.CharField(max_length=100, default="")


class Project(models.Model):
    code = models.IntegerField()
    name = models.CharField(max_length=100, default="")
    client = models.CharField(max_length=500, default="")
    start_date = models.DateTimeField(default=datetime.now)
    end_date = models.DateTimeField(default=datetime.now)
    board = models.ForeignKey(Board, blank=True, null=True)
    team = models.ForeignKey(Team)
    is_active = models.BooleanField(default=True)


class Column(models.Model):
    name = models.CharField(max_length=100, default="")
    wip = models.IntegerField()
    location = models.FloatField()
    parent_column = models.ForeignKey('self', null=True)
    board = models.ForeignKey(Board)
    is_border = models.BooleanField(default=False)
    is_high_priority = models.BooleanField(default=False)
    acceptance_test = models.BooleanField(default=False)


class RoleTeam(models.Model):
    user_team = models.ForeignKey(UserTeam)
    role = models.ForeignKey(Group)


class Card(models.Model):
    type = models.TextField(max_length=100, default="")
    name = models.TextField(max_length=100, default="")
    content = models.TextField(max_length=1500, default="")
    creation_date = models.DateTimeField(default=datetime.now)
    completion_date = models.DateTimeField(null=True)
    development_start_date = models.DateTimeField(null=True)
    done_date = models.DateTimeField(null=True)
    is_active = models.BooleanField(default=True)
    column = models.ForeignKey(Column)
    project = models.ForeignKey(Project, null=True)
    user = models.ForeignKey(User, null=True)
    story_points = models.DecimalField(null=True, max_digits=5,
                                    decimal_places=2, default=0)


class Move(models.Model):
    date = models.DateTimeField(default=datetime.now)
    is_legal = models.BooleanField(default=True)
    description = models.TextField(max_length=1500, default="")
    card = models.ForeignKey(Card)
    user = models.ForeignKey(User)
    from_position = models.ForeignKey(Column, null=True,
                                      related_name="from_position")
    to_position = models.ForeignKey(Column,
                                    related_name="to_position",
                                    default=None,
                                    null=True)


class Task(models.Model):
    hours = models.DecimalField(
        max_digits=7, decimal_places=2, blank=True, default=Decimal('0.00'))
    is_complete = models.BooleanField(default=False)
    card = models.ForeignKey(Card)
    user = models.ForeignKey(User)


class Permission(models.Model):
    role = models.ForeignKey(Group, related_name='role')
    from_position = models.ForeignKey(Column, related_name='from')
    to_position = models.ForeignKey(Column, related_name='to')
