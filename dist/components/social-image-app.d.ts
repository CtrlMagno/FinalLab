export declare class SocialImageApp extends HTMLElement {
    private selectedFiles;
    constructor();
    connectedCallback(): Promise<void>;
    loadExistingMedia(): Promise<void>;
    render(): void;
    setupEventListeners(): void;
    updatePreviewGrid(): void;
    handleMediaUpload(file: File): Promise<void>;
}
