// src/components/editor/FileUpload.tsx
import React, { useState } from "react";
import { Button } from "../ui/button";
import { UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePlanGate } from "@/hooks/usePlanGate";
import { useAuth } from "@/hooks/useAuth";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  accept = "image/*",
  maxFiles = 5,
  maxSize = 5, // 5MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { requireStorage } = usePlanGate();
  const { user } = useAuth();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload files.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Per-file size cap
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum size of ${maxSize}MB.`,
          variant: "destructive",
        });
        continue;
      }

      // Plan/storage gate before upload
      const gate = requireStorage(file.size);
      if (!gate.ok) {
        // toast already shown by requireStorage
        continue;
      }

      try {
        const ext = file.name.includes(".")
          ? file.name.split(".").pop()
          : "bin";
        const safeName = file.name.replace(/[^\w.-]+/g, "_");
        const filename = `${Date.now()}-${safeName}`;
        const path = `${user.id}/${filename}`;

        const { error: uploadError, data } = await supabase.storage
          .from("content_media")
          .upload(path, file, {
            upsert: false,
            // IMPORTANT: this metadata powers server-side storage usage mirroring
            metadata: { owner_id: user.id, size: file.size },
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("content_media").getPublicUrl(data!.path);

        onFileUploaded(publicUrl);
        setUploadedFiles((prev) => [...prev, publicUrl]);

        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Upload failed",
          description: `There was an error uploading ${file.name}.`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Drag and drop files here, or{" "}
            <label className="relative cursor-pointer text-primary hover:text-primary/80">
              <span>browse</span>
              <input
                type="file"
                className="sr-only"
                onChange={handleFileInput}
                accept={accept}
                multiple={maxFiles > 1}
                disabled={isUploading || uploadedFiles.length >= maxFiles}
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {accept === "image/*" ? "PNG, JPG, GIF up to " : "Files up to "}
            {maxSize}MB
            {maxFiles > 1 ? ` (Max ${maxFiles} files)` : ""}
          </p>
        </div>
        {isUploading && (
          <div className="mt-4">
            <p className="text-sm">Uploading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
