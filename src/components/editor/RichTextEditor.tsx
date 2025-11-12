
import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../ui/button';
import { ImageIcon } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface RichTextEditorProps {
  value?: string;
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value = '',
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = ''
}) => {
  const initialContent = value || content;
  const [editorValue, setEditorValue] = useState(initialContent);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);
  
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'image'
  ];

  const handleChange = (newContent: string) => {
    setEditorValue(newContent);
    onChange(newContent);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`border border-border rounded-md overflow-hidden bg-background ${className}`}>
      <div className="flex items-center p-2 border-b border-border bg-muted/30">
        <div className="flex-1">
          {/* ReactQuill will show its own toolbar */}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={triggerImageUpload}
          className="ml-2"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="min-h-[300px]"
      />
      
      <ImageUploader 
        fileInputRef={fileInputRef} 
        quillRef={quillRef} 
      />
    </div>
  );
};

export default RichTextEditor;
