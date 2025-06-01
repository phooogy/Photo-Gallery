import { useState, useRef, ChangeEvent } from 'react';
import './PhotoGallery.css';

interface Photo {
  url: string;
  id: number;
}

type ViewMode = 'stroll' | 'grid';

export const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('stroll');
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const strollContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        setPhotos(prev => [...prev, {
          url: e.target?.result as string,
          id: Date.now() + i
        }]);
      };

      reader.readAsDataURL(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteImage = (idToDelete: number) => {
    setPhotos(prev => prev.filter(photo => photo.id !== idToDelete));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setIsMenuOpen(false);
  };

  const handleGridImageClick = (photo: Photo) => {
    setSelectedPhotoId(photo.id);
    setViewMode('stroll');
    
    // Wait for view mode change and DOM update
    setTimeout(() => {
      const imageElement = document.getElementById(`photo-${photo.id}`);
      if (imageElement) {
        imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="photo-gallery">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
      />

      <div className="menu-container">
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          MENU
        </button>
        <div className={`menu-dropdown ${isMenuOpen ? 'open' : ''}`}>
          <button 
            className="menu-item upload-item"
            onClick={handleUploadClick}
          >
            upload
          </button>
          <button 
            className={`menu-item stroll-item ${viewMode === 'stroll' ? 'active' : ''}`}
            onClick={() => handleViewChange('stroll')}
          >
            stroll
          </button>
          <button 
            className={`menu-item grid-item ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleViewChange('grid')}
          >
            grid
          </button>
        </div>
      </div>

      <div className="gallery-container" ref={strollContainerRef}>
        {photos.length > 0 ? (
          viewMode === 'stroll' ? (
            <div className="images-grid stroll-view">
              {photos.map((photo) => (
                <div 
                  key={photo.id} 
                  className={`image-container ${selectedPhotoId === photo.id ? 'selected' : ''}`}
                  id={`photo-${photo.id}`}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${photo.id}`}
                  />
                  <button 
                    className="delete-button"
                    onClick={() => deleteImage(photo.id)}
                    title="Delete this image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="images-grid grid-view">
              {photos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="image-container preview"
                  onClick={() => handleGridImageClick(photo)}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${photo.id}`}
                  />
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImage(photo.id);
                    }}
                    title="Delete this image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            No photos uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}; 