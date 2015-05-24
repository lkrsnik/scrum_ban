from django.conf.urls import url, include
from django.views.generic import TemplateView
from rest_framework import routers
from app.views import user, auth
from django.contrib import admin

router = routers.DefaultRouter()
router.register(r'users', user.UserViewSet)
router.register(r'groups', user.GroupViewSet)
router.register(r'session', auth.SessionViewSet, 'session')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name="index.html")),
    url(r'^api/', include(router.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api-auth/', include('rest_framework.urls',
        namespace='rest_framework')),
    url(r'^api-token-auth/', 'rest_framework_jwt.views.obtain_jwt_token'),
]
