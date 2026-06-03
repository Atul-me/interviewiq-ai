import { useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { FileText, Upload, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

const ResumeUpload = ({ currentResumeUrl, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const uploadFile = async (file) => {
    // 1. Local checks: File Type
    if (file.type !== 'application/pdf') {
      addToast('Only PDF resumes are supported', 'error');
      return;
    }

    // 2. Local checks: File Size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      addToast('Resume size exceeds the 5MB limit', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axiosClient.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        addToast('Resume uploaded and parsed successfully!', 'success');
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data.user);
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload and parse resume.';
      addToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const getFileName = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
        <FileText className="w-4.5 h-4.5 text-brand-400" />
        <span>Resume Integration</span>
      </h3>
      
      <p className="text-xs text-slate-400 leading-relaxed">
        Upload your resume in PDF format to let the AI tailor mock interview sessions directly to your background projects.
      </p>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all relative ${
          dragActive
            ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/5 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700/80 bg-dark-950/40'
        }`}
      >
        {uploading ? (
          <div className="py-4 space-y-3">
            <Loader className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-brand-400 animate-pulse">
              Parsing and extracting text...
            </p>
          </div>
        ) : (
          <>
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
              <Upload className="w-8 h-8 text-slate-500 mx-auto transition-colors group-hover:text-slate-300" />
              <div className="text-xs font-semibold text-brand-500 hover:text-brand-400">
                Click to upload PDF
              </div>
              <p className="text-[10px] text-slate-500">or drag and drop file here (Max 5MB)</p>
            </label>
          </>
        )}
      </div>

      {/* Current Resume Metadata Badge */}
      {currentResumeUrl && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs">
          <div className="flex items-center space-x-2 truncate pr-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium truncate">{getFileName(currentResumeUrl)}</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
            Active
          </span>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
