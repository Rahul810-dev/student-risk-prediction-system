import React, { useState, useRef } from 'react';
import { MdClose, MdCloudUpload, MdCheckCircle } from 'react-icons/md';
import * as XLSX from 'xlsx';

export default function UploadExcelModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      setTimeout(() => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          console.log('File successfully parsed', wb.SheetNames);
          
          setLoading(false);
          setSuccess(true);
          setFile(null);
          
          setTimeout(() => {
            onClose();
            setSuccess(false);
          }, 2000);
        } catch (error) {
          console.error("Error reading excel file", error);
          setLoading(false);
          alert("Error parsing excel file. Please ensure it's a valid .xlsx or .xls file.");
        }
      }, 1000);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: 'white', width: '400px', borderRadius: '16px',
        padding: '24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '20px'
        }}>
          <MdClose />
        </button>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          Upload Data
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          Upload Students, Attendance, or Marks records in Excel (.xlsx) format.
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <MdCheckCircle style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Upload Successful!</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Records have been updated successfully.</div>
          </div>
        ) : (
          <>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px',
                textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            >
              <MdCloudUpload style={{ fontSize: '40px', color: '#94a3b8', marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                {file ? file.name : 'Click to browse Excel file'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Supports .xlsx, .xls
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                style={{ display: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '10px', background: 'white', border: '1px solid #cbd5e1',
                borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer'
              }}>
                Cancel
              </button>
              <button 
                onClick={handleUpload} 
                disabled={!file || loading}
                style={{
                  flex: 1, padding: '10px', background: !file || loading ? '#94a3b8' : '#3b82f6', border: 'none',
                  borderRadius: '8px', color: 'white', fontWeight: 600, cursor: !file || loading ? 'not-allowed' : 'pointer'
                }}>
                {loading ? 'Uploading...' : 'Upload Data'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
