// src/components/editor/ImageUploader.tsx
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { usePlanGate } from "@/hooks/usePlanGate";
import { useAuth } from "@/hooks/useAuth";

interface ImageUploaderProps {
  fileInputRef?: React.RefObject<HTMLInputElement>;
  quillRef?: React.RefObject<any>;
  onImageUploaded?: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  fileInputRef: externalFileInputRef,
  quillRef,
  onImageUploaded,
}) => {
  const { toast } = useToast();
  const internalFileInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = externalFileInputRef || internalFileInputRef;
  const { requireStorage } = usePlanGate();
  const { user } = useAuth();

  const handleImageUpload = async (file: File) => {
    try {
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to upload images.",
          variant: "destructive",
        });
        return;
      }

      // quota gate
      const gate = requireStorage(file.size);
      if (!gate.ok) return; // toast already shown by requireStorage

      // path: content_media/<userId>/<timestamp>-<safeName>
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const filename = `${Date.now()}-${safeName}`;
      const path = `${user.id}/${filename}`;

      const { error: uploadError, data } = await supabase.storage
        .from("content_media")
        .upload(path, file, {
          upsert: false,
          metadata: { owner_id: user.id, size: file.size }, // important for server usage tracking
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("content_media").getPublicUrl(data!.path);

      // Insert into Quill editor if provided
      if (quillRef?.current) {
        const quill = quillRef.current.getEditor
          ? quillRef.current.getEditor()
          : quillRef.current;
        const range = quill.getSelection() || { index: quill.getLength(), length: 0 };
        quill.insertEmbed(range.index, "image", publicUrl);
        quill.setSelection(range.index + 1, 0);
      }

      // Callback
      onImageUploaded?.(publicUrl);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      handleImageUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {!externalFileInputRef && (
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileUpload}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
      )}
    </div>
  );
};

export default ImageUploader;
