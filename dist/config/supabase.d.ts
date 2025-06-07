export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const uploadMedia: (file: File) => Promise<string>;
export declare const getMediaList: () => Promise<{
    name: string;
    url: string;
    type: any;
}[]>;
