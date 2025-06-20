document.addEventListener('DOMContentLoaded', function() {
    // Constantes de configuração
    const BUCKET_NAME = 'catalogo';
    const TABLE_NAME = 'imagens-catalogo';
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    // Elementos do DOM
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const galleryContainer = document.getElementById('galleryContainer');

    // Carregar galeria inicial
    async function loadGalleryImages() {
        try {
            galleryContainer.innerHTML = '<p class="loading-message">Carregando imagens...</p>';
            
            const { data: images, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            if (!images || images.length === 0) {
                galleryContainer.innerHTML = '<p class="empty-message">Nenhuma imagem encontrada.</p>';
                return;
            }

            renderGallery(images);
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            galleryContainer.innerHTML = '<p class="error-message">Erro ao carregar imagens. Tente novamente mais tarde.</p>';
        }
    }

    // Renderizar a galeria
    function renderGallery(images) {
        galleryContainer.innerHTML = '';
        
        images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${image.image_url}" alt="${image.title}" 
                     loading="lazy" class="gallery-image">
                <div class="gallery-info">
                    <h3 class="image-title">${image.title}</h3>
                    <p class="image-description">${image.description || 'Sem descrição'}</p>
                    <small class="upload-date">
                        ${new Date(image.uploaded_at).toLocaleDateString('pt-BR')}
                    </small>
                </div>
            `;
            galleryContainer.appendChild(galleryItem);
        });
    }

    // Upload de imagem
    async function uploadImage(file, title, description) {
        try {
            // Validação básica
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
            }
            
            if (file.size > MAX_FILE_SIZE) {
                throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
            }

            // Upload para o storage
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Obter URL pública e salvar no banco
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName);

            const { error: insertError } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    title,
                    description,
                    image_url: publicUrl,
                    file_name: fileName
                }]);

            if (insertError) throw insertError;

            return true;
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    }

    // Preview da imagem selecionada
    function handleFilePreview(file) {
        if (!file) {
            resetPreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            if (previewPlaceholder) previewPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function resetPreview() {
        imagePreview.style.display = 'none';
        imagePreview.src = '#';
        if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    }

    // Event listeners
    imageInput.addEventListener('change', function(e) {
        handleFilePreview(e.target.files[0]);
    });

    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const file = imageInput.files[0];
        const title = document.getElementById('imageTitle').value.trim();
        const description = document.getElementById('imageDescription').value.trim();

        try {
            if (!file) throw new Error('Selecione uma imagem');
            if (!title) throw new Error('Informe um título');
            
            await uploadImage(file, title, description);
            
            alert('Imagem enviada com sucesso!');
            uploadForm.reset();
            resetPreview();
            await loadGalleryImages();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

    // Iniciar a galeria
    loadGalleryImages();
});