from .models import File,StorageSavings
from utils.utils import compute_file_hash
from django.db.models import F
class FileService:
    """Handles file storage and deduplication."""

    def __init__(self, file:File):
        self.file = file

    def is_duplicate(self,hash:str):
        """Checks if the file already exists in the database."""
        return File.objects.filter(hash=hash).first()

    def store(self):
        """Stores the file only if it’s unique."""
        hash  = compute_file_hash(self.file.file)
        self.file.hash = hash
        existing_file:File = self.is_duplicate(hash=hash)
        if existing_file:
            self.file.file = existing_file.file
            savings, _ = StorageSavings.objects.get_or_create(hash=hash)
            savings.saved_size = F('saved_size') + self.file.size
            savings.file_count = F('file_count') + 1
            savings.save(update_fields=['saved_size', 'file_count', 'updated_at'])

        # Store metadata in DB
        self.file.save()
        return
