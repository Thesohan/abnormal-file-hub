from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileViewSet,StorageSavingsViewSet

router = DefaultRouter()
router.register(r'files', FileViewSet)
router.register(r'storage-savings', StorageSavingsViewSet, basename='storage-savings')


urlpatterns = [
    path('', include(router.urls)),
] 