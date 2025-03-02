from rest_framework import serializers
from .models import File, FileType, StorageSavings

class FileSerializer(serializers.ModelSerializer):
    file_type = serializers.ChoiceField(choices=FileType.choices, read_only=True)

    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'uploaded_at', 'hash']
        read_only_fields = ['id','original_filename', 'uploaded_at', 'hash', 'file_type', 'size']

class StorageSavingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorageSavings
        fields = ['hash', 'saved_size', 'file_count', 'updated_at']
