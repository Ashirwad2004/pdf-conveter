'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
            setJobId(null); // Reset job on new file
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    const uploadFile = async () => {
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('raw_files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Create Job in API with the *actual* storage path
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            const response = await fetch(`${apiUrl}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_file_path: uploadData.path,
                    conversion_type: 'pdf-to-word' // TODO: Make dynamic based on selection
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                setJobId(result.jobId);
            }

        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    "relative group overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ease-out",
                    isDragActive
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    file ? "border-green-500/50 bg-green-500/5" : ""
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                        "rounded-full p-4 transition-colors duration-300",
                        isDragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                        file ? "bg-green-500/10 text-green-500" : ""
                    )}>
                        {file ? <FileText className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
                    </div>
                    <div className="space-y-1">
                        <p className={cn("text-lg font-medium transition-colors", isDragActive ? "text-primary" : "text-foreground")}>
                            {file ? file.name : (isDragActive ? "Drop it like it's hot!" : "Click to upload or drag and drop")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX (Max 10MB)"}
                        </p>
                    </div>
                </div>

                {/* Success/Error overlays could go here */}
            </div>

            <AnimatePresence>
                {file && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4"
                    >
                        <Button
                            onClick={(e) => { e.stopPropagation(); setFile(null); setJobId(null); }}
                            variant="ghost"
                            className="flex-1 text-muted-foreground hover:text-destructive"
                            disabled={uploading}
                        >
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button
                            onClick={uploadFile}
                            disabled={uploading || !!jobId}
                            className={cn("flex-1", jobId ? "bg-green-600 hover:bg-green-700" : "")}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                </>
                            ) : jobId ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                                </>
                            ) : (
                                "Convert Now"
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {jobId && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center text-green-600"
                >
                    <p className="font-semibold">Conversion queued successfully!</p>
                    <p className="text-xs opacity-80 mt-1">Job ID: {jobId}</p>
                </motion.div>
            )}
        </div>
    );
}
