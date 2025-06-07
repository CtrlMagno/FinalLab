import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yaovmbbcqytepoduyuuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb3ZtYmJjcXl0ZXBvZHV5dXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA1MjksImV4cCI6MjA2NDgxNjUyOX0.3eiK7BPGSgjOku7r-UgxOjFACzSdvVA6rWsTc_C7OHU';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Las credenciales de Supabase no están configuradas correctamente');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'memes';

export const uploadMedia = async (file: File) => {
    try {
        if (!file || !(file instanceof File)) {
            throw new Error('Archivo inválido');
        }

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('El archivo es demasiado grande. Tamaño máximo: 50MB');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('Intentando subir archivo:', {
            nombre: file.name,
            tipo: file.type,
            tamaño: file.size,
            ruta: filePath
        });

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Error detallado al subir el archivo:', {
                mensaje: error.message,
                nombre: error.name
            });
            throw error;
        }

        console.log('Archivo subido exitosamente:', data);

        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        console.log('URL pública generada:', publicUrl);

        return publicUrl;
    } catch (error) {
        console.error('Error en uploadMedia:', error);
        throw error;
    }
};

export const getMediaList = async () => {
    try {
        console.log('Obteniendo lista de archivos...');
        
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list();

        if (error) {
            console.error('Error al obtener la lista de archivos:', {
                mensaje: error.message,
                nombre: error.name
            });
            throw error;
        }

        console.log('Archivos encontrados:', data);

        return data.map(item => {
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(item.name);
            return {
                name: item.name,
                url: publicUrl,
                type: item.metadata.mimetype
            };
        });
    } catch (error) {
        console.error('Error en getMediaList:', error);
        throw error;
    }
}; 