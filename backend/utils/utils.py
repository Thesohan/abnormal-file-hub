import hashlib

CHUNK_SIZE = 8192 # 8KB

def compute_file_hash(file_obj, chunk_size=CHUNK_SIZE):
    """Compute SHA-256 hash for a file object."""
    hasher = hashlib.sha256()
    file_obj.seek(0)  # Reset file pointer
    for chunk in iter(lambda: file_obj.read(chunk_size), b""):
        hasher.update(chunk)
    file_obj.seek(0)  # Reset again after reading
    return hasher.hexdigest()