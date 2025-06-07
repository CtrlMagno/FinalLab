import { uploadMedia, getMediaList } from '../config/supabase';

export class SocialImageApp extends HTMLElement {
    private selectedFiles: File[] = [];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.render();
        await this.loadExistingMedia();
    }

    async loadExistingMedia() {
        try {
            const mediaGrid = this.shadowRoot?.getElementById('mediaGrid');
            if (!mediaGrid) return;

            mediaGrid.innerHTML = '<div class="loading">Cargando contenido...</div>';

            const mediaList = await getMediaList();
            
            mediaGrid.innerHTML = '';

            mediaList.forEach(media => {
                const mediaElement = document.createElement('div');
                mediaElement.className = 'media-container';
                
                const isVideo = media.type.startsWith('video/');
                const mediaType = isVideo ? 'video' : 'imagen';
                
                if (isVideo) {
                    const video = document.createElement('video');
                    video.src = media.url;
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    mediaElement.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = media.url;
                    img.alt = 'Contenido subido';
                    mediaElement.appendChild(img);
                }

                const typeIndicator = document.createElement('div');
                typeIndicator.className = 'media-type-indicator';
                typeIndicator.textContent = mediaType;
                mediaElement.appendChild(typeIndicator);

                mediaGrid.appendChild(mediaElement);

                if (isVideo) {
                    const video = mediaElement.querySelector('video');
                    if (video) {
                        video.play().catch(error => {
                            console.log('Error al reproducir el video automáticamente:', error);
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error al cargar los archivos:', error);
            const mediaGrid = this.shadowRoot?.getElementById('mediaGrid');
            if (mediaGrid) {
                mediaGrid.innerHTML = '<div class="error">Error al cargar el contenido. Por favor, intenta de nuevo.</div>';
            }
        }
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100vh;
                    background-color: #f5f1e8;
                    font-family: 'Poppins', sans-serif;
                }

                .app-container {
                    display: flex;
                    height: 100%;
                }

                .sidebar {
                    width: 250px;
                    background-color: #e8dcc4;
                    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                }

                .logo {
                    font-size: 28px;
                    font-weight: 700;
                    color: #8b7355;
                    margin-bottom: 30px;
                    text-align: center;
                    letter-spacing: -0.5px;
                    text-transform: uppercase;
                }

                .upload-button {
                    background-color: #8b7355;
                    color: #f5f1e8;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 20px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    letter-spacing: 0.3px;
                }

                .upload-button:hover {
                    background-color: #6d5a43;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(139, 115, 85, 0.2);
                }

                .upload-button:active {
                    transform: translateY(0);
                }

                .main-content {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }

                .image-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }

                .media-container {
                    position: relative;
                    padding-bottom: 100%;
                    overflow: hidden;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    background-color: #ffffff;
                }

                .media-container:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 16px rgba(139, 115, 85, 0.15);
                }

                .media-container img,
                .media-container video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .media-type-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background-color: rgba(139, 115, 85, 0.8);
                    color: #f5f1e8;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .loading, .error {
                    text-align: center;
                    padding: 20px;
                    color: #8b7355;
                    font-size: 16px;
                }

                .error {
                    color: #d32f2f;
                }

                input[type="file"] {
                    display: none;
                }

                .upload-icon {
                    width: 20px;
                    height: 20px;
                    fill: currentColor;
                }

                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    justify-content: center;
                    align-items: center;
                }

                .modal.active {
                    display: flex;
                }

                .modal-content {
                    background-color: #f5f1e8;
                    padding: 20px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                .preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .preview-item {
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    background-color: #ffffff;
                }

                .preview-media {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    display: block;
                }

                .preview-remove {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background-color: rgba(139, 115, 85, 0.8);
                    color: #f5f1e8;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.3s ease;
                }

                .preview-remove:hover {
                    background-color: rgba(109, 90, 67, 0.9);
                }

                .modal-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .modal-button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .confirm-button {
                    background-color: #8b7355;
                    color: #f5f1e8;
                }

                .confirm-button:hover {
                    background-color: #6d5a43;
                }

                .cancel-button {
                    background-color: #e8dcc4;
                    color: #8b7355;
                }

                .cancel-button:hover {
                    background-color: #d4c5a8;
                }

                .preview-count {
                    color: #8b7355;
                    font-size: 14px;
                    margin-bottom: 15px;
                }

                .preview-type {
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    background-color: rgba(139, 115, 85, 0.8);
                    color: #f5f1e8;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .app-container {
                        flex-direction: column;
                    }

                    .sidebar {
                        width: 100%;
                        padding: 15px;
                    }

                    .logo {
                        font-size: 24px;
                        margin-bottom: 20px;
                    }

                    .image-grid {
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 15px;
                        padding: 15px;
                    }

                    .modal-content {
                        width: 95%;
                        margin: 10px;
                    }

                    .preview-grid {
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    }
                }
            </style>

            <div class="app-container">
                <div class="sidebar">
                    <div class="logo">Memes</div>
                    <input type="file" id="mediaUpload" accept="image/*,video/*" multiple>
                    <button class="upload-button" id="uploadButton">
                        <svg class="upload-icon" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Subir Contenido
                    </button>
                </div>
                <div class="main-content">
                    <div class="image-grid" id="mediaGrid"></div>
                </div>
            </div>

            <div class="modal" id="previewModal">
                <div class="modal-content">
                    <div class="preview-count" id="previewCount"></div>
                    <div class="preview-grid" id="previewGrid"></div>
                    <div class="modal-buttons">
                        <button class="modal-button cancel-button" id="cancelButton">Cancelar</button>
                        <button class="modal-button confirm-button" id="confirmButton">Confirmar</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const uploadButton = this.shadowRoot?.getElementById('uploadButton');
        const mediaUpload = this.shadowRoot?.getElementById('mediaUpload') as HTMLInputElement;
        const previewModal = this.shadowRoot?.getElementById('previewModal');
        const previewGrid = this.shadowRoot?.getElementById('previewGrid');
        const previewCount = this.shadowRoot?.getElementById('previewCount');
        const cancelButton = this.shadowRoot?.getElementById('cancelButton');
        const confirmButton = this.shadowRoot?.getElementById('confirmButton');

        uploadButton?.addEventListener('click', () => {
            mediaUpload?.click();
        });

        mediaUpload?.addEventListener('change', (event) => {
            const files = Array.from((event.target as HTMLInputElement).files || []);
            if (files.length > 0) {
                this.selectedFiles = files;
                this.updatePreviewGrid();
                previewModal?.classList.add('active');
            }
        });

        cancelButton?.addEventListener('click', () => {
            previewModal?.classList.remove('active');
            this.selectedFiles = [];
            if (mediaUpload) {
                mediaUpload.value = '';
            }
            if (previewGrid) {
                previewGrid.innerHTML = '';
            }
        });

        confirmButton?.addEventListener('click', async () => {
            try {
                for (const file of this.selectedFiles) {
                    await this.handleMediaUpload(file);
                }
                previewModal?.classList.remove('active');
                this.selectedFiles = [];
                if (mediaUpload) {
                    mediaUpload.value = '';
                }
                if (previewGrid) {
                    previewGrid.innerHTML = '';
                }
            } catch (error) {
                console.error('Error al subir los archivos:', error);
            }
        });
    }

    updatePreviewGrid() {
        const previewGrid = this.shadowRoot?.getElementById('previewGrid');
        const previewCount = this.shadowRoot?.getElementById('previewCount');
        
        if (previewGrid && previewCount) {
            previewGrid.innerHTML = '';
            previewCount.textContent = `${this.selectedFiles.length} archivo(s) seleccionado(s)`;

            this.selectedFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    
                    const isVideo = file.type.startsWith('video/');
                    const mediaType = isVideo ? 'video' : 'imagen';
                    
                    previewItem.innerHTML = `
                        ${isVideo ? 
                            `<video class="preview-media" src="${e.target?.result}" muted></video>` :
                            `<img class="preview-media" src="${e.target?.result}" alt="Vista previa ${index + 1}">`
                        }
                        <div class="preview-type">${mediaType}</div>
                        <button class="preview-remove" data-index="${index}">×</button>
                    `;
                    previewGrid.appendChild(previewItem);

                    const removeButton = previewItem.querySelector('.preview-remove');
                    removeButton?.addEventListener('click', () => {
                        this.selectedFiles.splice(index, 1);
                        this.updatePreviewGrid();
                    });

                    if (isVideo) {
                        const video = previewItem.querySelector('video');
                        video?.addEventListener('mouseover', () => video.play());
                        video?.addEventListener('mouseout', () => video.pause());
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }

    async handleMediaUpload(file: File) {
        try {
            const publicUrl = await uploadMedia(file);
            const mediaGrid = this.shadowRoot?.getElementById('mediaGrid');
            
            if (mediaGrid) {
                const mediaElement = document.createElement('div');
                mediaElement.className = 'media-container';
                
                const isVideo = file.type.startsWith('video/');
                const mediaType = isVideo ? 'video' : 'imagen';
                
                if (isVideo) {
                    const video = document.createElement('video');
                    video.src = publicUrl;
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    mediaElement.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = publicUrl;
                    img.alt = 'Contenido subido';
                    mediaElement.appendChild(img);
                }

                const typeIndicator = document.createElement('div');
                typeIndicator.className = 'media-type-indicator';
                typeIndicator.textContent = mediaType;
                mediaElement.appendChild(typeIndicator);

                mediaGrid.appendChild(mediaElement);

                if (isVideo) {
                    const video = mediaElement.querySelector('video');
                    if (video) {
                        video.play().catch(error => {
                            console.log('Error al reproducir el video automáticamente:', error);
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            throw error;
        }
    }
}

customElements.define('social-image-app', SocialImageApp); 