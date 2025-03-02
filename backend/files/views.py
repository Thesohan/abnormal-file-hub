from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer
from .services import FileService
from rest_framework import filters, status, viewsets
from rest_framework.response import Response
from .models import File, FileType, StorageSavings
from .serializers import FileSerializer
from .services import FileService
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from rest_framework.decorators import action
from .serializers import StorageSavingsSerializer

class FileFilter(django_filters.FilterSet):
    file_type = django_filters.ChoiceFilter(field_name="file_type", choices=FileType.choices)
    min_size = django_filters.NumberFilter(field_name="size", lookup_expr="gte")
    max_size = django_filters.NumberFilter(field_name="size", lookup_expr="lte")
    upload_date = django_filters.DateFilter(field_name="uploaded_at", lookup_expr="date")

    class Meta:
        model = File
        fields = ["file_type", "size", "uploaded_at"]

# Create your views here.

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FileFilter
    search_fields = ["original_filename"]
    ordering_fields = ["created_at", "size"]

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        data = {
            'file': file_obj,
            'original_filename': file_obj.name,
            'file_type': file_obj.content_type,
            'size': file_obj.size,
        }        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        file_service = FileService(file=File(**data))
        file_service.store()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
class StorageSavingsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StorageSavings.objects.all()
    serializer_class = StorageSavingsSerializer  # Returns list of savings per file hash

    @action(detail=False, methods=['get'])
    def total_savings(self, request):
        total_savings = StorageSavings.objects.aggregate(Sum('saved_size'))['saved_size__sum'] or 0
        total_deduplicated_files = StorageSavings.objects.aggregate(Sum('file_count'))['file_count__sum'] or 0

        return Response({
            'total_savings': total_savings,  # Total bytes saved
            'total_deduplicated_files': total_deduplicated_files  # Number of deduplicated files
        })
