'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, CheckCircle2, Loader2, ChevronDown, Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CONVERSION_TYPES = [
    { id: 'pdf-to-word', label: 'PDF to Word', accept: { 'application/pdf': ['.pdf'] } },
    { id: 'word-to-pdf', label: 'Word to PDF', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] } },
    { id: 'jpg-to-pdf', label: 'JPG to PDF', accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] } },
    { id: 'excel-to-pdf', label: 'Excel to PDF', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] } },
    { id: 'ppt-to-pdf', label: 'PowerPoint to PDF', accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'], 'application/vnd.ms-powerpoint': ['.ppt'] } },
];

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [conversionType, setConversionType] = useState(CONVERSION_TYPES[0].id);
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const activeConversion = CONVERSION_TYPES.find(t => t.id === conversionType) || CONVERSION_TYPES[0];

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
            setFile(acceptedFiles[0]);
            setJobId(null); // Reset job on new file
            setStatus('idle');
            setResultUrl(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: activeConversion.accept
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
                    conversion_type: conversionType
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                setJobId(result.jobId);
                setStatus('processing');
            }

        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
            setStatus('failed');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (!jobId || status === 'completed' || status === 'failed') return;

        const interval = setInterval(async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
                const res = await fetch(`${apiUrl}/jobs/${jobId}`);
                const data = await res.json();

                if (data.state === 'completed') {
                    setStatus('completed');
                    setResultUrl(data.result?.resultUrl || null); // Ensure we get the URL
                    clearInterval(interval);
                } else if (data.state === 'failed') {
                    setStatus('failed');
                    clearInterval(interval);
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [jobId, status]);

    return (
        <div className="w-full max-w-xl mx-auto space-y-6">
            <div className="flex justify-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-[200px] justify-between">
                            {activeConversion.label}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]">
                        {CONVERSION_TYPES.map((type) => (
                            <DropdownMenuItem
                                key={type.id}
                                onClick={() => {
                                    setConversionType(type.id);
                                    setFile(null); // Clear file on type change to avoid mismatch
                                    setJobId(null);
                                    setStatus('idle');
                                    setResultUrl(null);
                                }}
                            >
                                {type.label}
                                {conversionType === type.id && <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

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
                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `Accepted: ${Object.values(activeConversion.accept).flat().join(', ')}`}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setJobId(null);
                                setStatus('idle');
                                setResultUrl(null);
                            }}
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
                    className={cn(
                        "rounded-lg border p-4 text-center",
                        status === 'processing' ? "border-blue-500/20 bg-blue-500/10 text-blue-600" :
                            status === 'completed' ? "border-green-500/20 bg-green-500/10 text-green-600" :
                                "border-red-500/20 bg-red-500/10 text-red-600"
                    )}
                >
                    {status === 'processing' && (
                        <>
                            <p className="font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Processing your file...
                            </p>
                            <p className="text-xs opacity-80 mt-1">This usually takes a few seconds.</p>
                        </>
                    )}
                    {status === 'completed' && (
                        <>
                            <p className="font-semibold flex items-center justify-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4" /> Conversion Complete!
                            </p>
                            {resultUrl && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => window.open(resultUrl, '_blank')}>
                                    <Download className="mr-2 h-4 w-4" /> Download File
                                </Button>
                            )}
                        </>
                    )}
                    {status === 'failed' && (
                        <p className="font-semibold flex items-center justify-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Conversion Failed. Please try again.
                        </p>
                    )}
                    <p className="text-xs opacity-60 mt-2">Job ID: {jobId}</p>
                </motion.div>
            )}
        </div>
    );
}
