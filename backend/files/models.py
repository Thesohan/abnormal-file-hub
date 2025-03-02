from django.db import models
import uuid
import os
from django.db import models

def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    ext = filename.split('.')[-1]
    filename = f"{instance.hash}.{ext}"
    return os.path.join('uploads', filename)

class FileType(models.TextChoices):
    IMAGE_PNG = "image/png"
    IMAGE_JPEG = "image/jpeg"
    IMAGE_GIF = "image/gif"
    APPLICATION_PDF = "application/pdf"
    TEXT_PLAIN = "text/plain"
    TEXT_CSV = "text/csv"
    IMAGE_BMP = "image/bmp"
    IMAGE_TIFF = "image/tiff"
    IMAGE_WEBP = "image/webp"
    AUDIO_MPEG = "audio/mpeg"
    AUDIO_OGG = "audio/ogg"
    AUDIO_WAV = "audio/wav"
    VIDEO_MP4 = "video/mp4"
    VIDEO_AVI = "video/x-msvideo"
    VIDEO_WEBM = "video/webm"
    APPLICATION_ZIP = "application/zip"
    APPLICATION_GZIP = "application/gzip"
    APPLICATION_JSON = "application/json"
    APPLICATION_XML = "application/xml"
    APPLICATION_MSWORD = "application/msword"
    APPLICATION_VND_MS_EXCEL = "application/vnd.ms-excel"
    APPLICATION_VND_MS_POWERPOINT = "application/vnd.ms-powerpoint"
    APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_SPREADSHEETML_SHEET = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    APPLICATION_VND_OPENXMLFORMATS_OFFICEDOCUMENT_PRESENTATIONML_PRESENTATION = "application/vnd.openxmlformats-officedocument.presentationml.presentation"

class File(models.Model):
    file_type_choices = [(tag, tag.value) for tag in FileType]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255,db_index=True)

    file_type = models.CharField(
        max_length=100,
        choices=FileType.choices,
        db_index=True
    )
    size = models.BigIntegerField(db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True,db_index=True)
    hash = models.CharField(max_length=64,default=None)  # SHA-256 hash
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.original_filename

class StorageSavings(models.Model):
    hash = models.CharField(max_length=64, unique=True)  # File hash for deduplication
    saved_size = models.BigIntegerField(default=0)  # Total bytes saved due to deduplication
    file_count = models.IntegerField(default=1)  # Number of files sharing this hash
    updated_at = models.DateTimeField(auto_now=True)  # Last update time
