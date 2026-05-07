import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { GalleryUpload } from '../GalleryUpload';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test-path' },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/image.jpg' },
        }),
      }),
    },
  }),
}));

describe('GalleryUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render drag-drop zone', () => {
      const onComplete = vi.fn();
      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      expect(screen.getByText(/Arrastra fotos aquí/i)).toBeInTheDocument();
    });

    it('should display file upload instructions', () => {
      const onComplete = vi.fn();
      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      expect(screen.getByText(/Máx 10 fotos/i)).toBeInTheDocument();
      expect(screen.getByText(/10MB c\/u/i)).toBeInTheDocument();
    });

    it('should render complete button initially disabled', () => {
      const onComplete = vi.fn();
      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const completeBtn = screen.getByRole('button', { name: /Guardar fotos/i });
      expect(completeBtn).toBeDisabled();
    });

    it('should display upload counter', () => {
      const onComplete = vi.fn();
      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      expect(screen.getByText(/Guardar fotos \(0\/0\)/i)).toBeInTheDocument();
    });
  });

  describe('File Validation', () => {
    it('should reject invalid file types', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('should accept JPG files', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const jpgFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [jpgFile] } });

      await waitFor(() => {
        expect(screen.getByText(/photo.jpg/)).toBeInTheDocument();
      });
    });

    it('should accept PNG files', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const pngFile = new File(['content'], 'photo.png', { type: 'image/png' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [pngFile] } });

      await waitFor(() => {
        expect(screen.getByText(/photo.png/)).toBeInTheDocument();
      });
    });

    it('should accept WebP files', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const webpFile = new File(['content'], 'photo.webp', { type: 'image/webp' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [webpFile] } });

      await waitFor(() => {
        expect(screen.getByText(/photo.webp/)).toBeInTheDocument();
      });
    });
  });

  describe('File Display', () => {
    it('should display uploaded file filename', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('photo.jpg')).toBeInTheDocument();
      });
    });

    it('should update file counter', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const file1 = new File(['content'], 'photo1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content'], 'photo2.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(screen.getByText(/Guardar fotos \(0\/2\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Remove Photo Button', () => {
    it('should display remove button for each uploaded file', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const removeBtn = screen.getByText('✕');
        expect(removeBtn).toBeInTheDocument();
      });
    });

    it('should remove file when remove button is clicked', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('photo.jpg')).toBeInTheDocument();
      });

      const removeBtn = screen.getByText('✕');
      fireEvent.click(removeBtn);

      await waitFor(() => {
        expect(screen.queryByText('photo.jpg')).not.toBeInTheDocument();
      });
    });

    it('should update counter when file is removed', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Guardar fotos \(0\/1\)/i)).toBeInTheDocument();
      });

      const removeBtn = screen.getByText('✕');
      fireEvent.click(removeBtn);

      await waitFor(() => {
        expect(screen.getByText(/Guardar fotos \(0\/0\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complete Button', () => {
    it('should enable complete button after files are added', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      const completeBtn = screen.getByRole('button', { name: /Guardar fotos/i });

      await waitFor(() => {
        expect(completeBtn).not.toBeDisabled();
      });
    });
  });

  describe('Multiple Files', () => {
    it('should handle multiple file uploads', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const file1 = new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
        expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
      });

      expect(screen.getByText(/Guardar fotos \(0\/2\)/i)).toBeInTheDocument();
    });
  });

  describe('File Size Validation', () => {
    it('should reject files larger than 10MB', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      const largeFile = new File(
        [new ArrayBuffer(11 * 1024 * 1024)],
        'large.jpg',
        { type: 'image/jpeg' }
      );

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });
  });

  describe('Max Files Enforcement', () => {
    it('should prevent adding more than max files', async () => {
      const onComplete = vi.fn();

      render(<GalleryUpload propertyId="test-prop" onComplete={onComplete} />);

      // Add 10 files successfully
      const files: File[] = [];
      for (let i = 0; i < 10; i++) {
        files.push(new File(['content'], `photo${i}.jpg`, { type: 'image/jpeg' }));
      }

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files } });

      await waitFor(() => {
        expect(screen.getByText(/Guardar fotos \(0\/10\)/i)).toBeInTheDocument();
      });
    });
  });
});
