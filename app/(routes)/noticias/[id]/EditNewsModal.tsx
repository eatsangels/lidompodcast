"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

interface News {
    id: string;
    title: string;
    content: string;
    image_url: string;
    video_url?: string;
    category: string;
}

interface EditNewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    news: News;
    onEditSuccess: () => void;
}

const EditNewsModal: React.FC<EditNewsModalProps> = ({ isOpen, onClose, news, onEditSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<News>();
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (news) {
            setValue('title', news.title);
            setValue('content', news.content);
            setValue('image_url', news.image_url);
            setValue('video_url', news.video_url || '');
            setValue('category', news.category);
        }
    }, [news, setValue]);

    if (!isOpen) return null;

    const onSubmit = async (data: News) => {
        try {
            setIsLoading(true);
            const { error } = await supabase
                .from("news")
                .update({
                    title: data.title,
                    content: data.content,
                    image_url: data.image_url,
                    video_url: embedUrl || data.video_url || null,
                    category: data.category,
                })
                .eq("id", news.id);

            if (error) throw error;
            reset();
            setEmbedUrl(null);
            onEditSuccess();
            alert("Noticia editada exitosamente");
        } catch (error) {
            console.error("Error al editar la noticia:", error);
            alert("Error al editar la noticia");
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmbedUrl(convertYouTubeUrl(e.target.value));
    };

    const convertYouTubeUrl = (url: string) => {
        if (!url) return null;
        const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^"&?\/\s]+)/;
        const match = url.match(regExp);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-xl font-semibold">Editar Noticia</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✖</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" {...register("title", { required: true })} />
                        {errors.title && <p className="text-red-500 text-sm">Este campo es obligatorio</p>}
                    </div>
                    <div>
                        <Label htmlFor="content">Contenido</Label>
                        <Textarea id="content" {...register("content", { required: true })} />
                        {errors.content && <p className="text-red-500 text-sm">Este campo es obligatorio</p>}
                    </div>
                    <div>
                        <Label htmlFor="image_url">URL de Imagen</Label>
                        <Input id="image_url" {...register("image_url", { required: true })} />
                        {errors.image_url && <p className="text-red-500 text-sm">Este campo es obligatorio</p>}
                    </div>
                    <div>
                        <Label htmlFor="video_url">URL de Video (YouTube)</Label>
                        <Input id="video_url" {...register("video_url")} onChange={handleVideoChange} />
                        {embedUrl && <iframe src={embedUrl} className="mt-2 w-full h-48" allowFullScreen />}
                    </div>
                    <div>
                        <Label htmlFor="category">Categoría</Label>
                        <Input id="category" {...register("category", { required: true })} />
                        {errors.category && <p className="text-red-500 text-sm">Este campo es obligatorio</p>}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNewsModal;
