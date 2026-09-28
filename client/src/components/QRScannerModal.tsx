import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, CheckCircle, Search, RefreshCw, Upload } from 'lucide-react';
import { Asset } from '../types';

interface QRScannerModalProps {
  onClose: () => void;
  onAssetFound: (asset: Asset) => void;
  assets: Asset[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  onAssetFound,
  assets,
}) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [matchedAsset, setMatchedAsset] = useState<Asset | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse scanned text and find matching asset
  const handleDecodedText = (decodedText: string) => {
    setScanResult(decodedText);
    setErrorMsg(null);

    let targetId = decodedText.trim();
    let targetName = '';
    let targetSanction = '';

    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.govAssetId) targetId = parsed.govAssetId;
      else if (parsed.assetId) targetId = parsed.assetId;

      if (parsed.name) targetName = parsed.name.toLowerCase();
      if (parsed.sanction) targetSanction = parsed.sanction.toLowerCase();
    } catch {
      // Not JSON or raw string (e.g. "GOV-WTR-4004")
      // Check if text has pattern like GOV-...
      const match = decodedText.match(/GOV-[A-Z]+-\d+/i) || decodedText.match(/AST-\d+/i);
      if (match) {
        targetId = match[0];
      }
    }

    const cleanTarget = targetId.toLowerCase().trim();

    const found = assets.find((a) => {
      const aId = (a.assetId || '').toLowerCase();
      const aName = (a.assetName || '').toLowerCase();
      const aSerial = (a.serialNumber || '').toLowerCase();
      const aSanction = (a.sanctionOrderNo || '').toLowerCase();

      return (
        aId === cleanTarget ||
        aId.includes(cleanTarget) ||
        cleanTarget.includes(aId) ||
        (aSerial && (aSerial === cleanTarget || cleanTarget.includes(aSerial))) ||
        (targetName && aName.includes(targetName)) ||
        (targetSanction && aSanction === targetSanction) ||
        aName.includes(cleanTarget)
      );
    });

    if (found) {
      setMatchedAsset(found);
      stopScanner();
    } else {
      setErrorMsg(`Scanned tag: "${decodedText.length > 60 ? decodedText.substring(0, 60) + '...' : decodedText}". No matching asset in active registry.`);
    }
  };

  const startScanner = async (cameraId?: string) => {
    try {
      setErrorMsg(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-container');
      }

      const devCameras = await Html5Qrcode.getCameras();
      if (!devCameras || devCameras.length === 0) {
        setErrorMsg('No camera detected on this device. You can upload a QR image or enter Asset ID below.');
        return;
      }

      setCameras(devCameras.map((c) => ({ id: c.id, label: c.label || `Camera ${c.id}` })));

      const activeCamId = cameraId || selectedCamera || devCameras[0].id;
      setSelectedCamera(activeCamId);

      await scannerRef.current.start(
        activeCamId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        () => {
          // Frame read callback (ignore non-matches)
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsScanning(false);
      setErrorMsg(
        err?.message?.includes('Permission')
          ? 'Camera permission denied. Allow camera access in your browser or upload an image file.'
          : 'Unable to access live webcam. You can upload a QR image or search by Asset ID below.'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Failed to stop camera scanner', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const camId = e.target.value;
    setSelectedCamera(camId);
    await stopScanner();
    startScanner(camId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg(null);
      // Temporarily stop camera if running to avoid canvas conflict
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }

      // Create clean file scanner instance on hidden div or reader
      const fileScanner = new Html5Qrcode('qr-reader-container');
      const decodedText = await fileScanner.scanFile(file, true);
      handleDecodedText(decodedText);
    } catch (err: any) {
      console.warn('QR file scan error:', err);
      setErrorMsg('No QR code detected in the uploaded photo. Ensure the QR is clear, well-lit, and in focus, or enter the ID below.');
    } finally {
      // Clear file input so the same file can be re-selected if needed
      if (e.target) e.target.value = '';
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDecodedText(manualCode);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#111827',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                Scan Physical QR / Barcode Tag
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                On-site verification via device camera or QR image
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Body */}
        <div style={{ padding: '20px' }}>
          {/* Matched Asset Card */}
          {matchedAsset ? (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10b981',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
                <CheckCircle size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Verified Government Asset Identified</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {matchedAsset.assetId} — {matchedAsset.assetName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                Location: <span style={{ color: '#e5e7eb' }}>{matchedAsset.location}</span> | Status:{' '}
                <span style={{ color: '#10b981', fontWeight: 600 }}>{matchedAsset.status}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                Category: <span style={{ color: '#e5e7eb' }}>{matchedAsset.category}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  onClick={() => {
                    stopScanner();
                    onAssetFound(matchedAsset);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Open Asset Profile & History
                </button>
                <button
                  onClick={() => {
                    setMatchedAsset(null);
                    setScanResult(null);
                    startScanner(selectedCamera);
                  }}
                  className="btn btn-secondary"
                >
                  <RefreshCw size={15} /> Scan Next
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Camera Feed Container */}
              <div
                id="qr-reader-container"
                style={{
                  width: '100%',
                  minHeight: '260px',
                  backgroundColor: '#030712',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />

              {/* Camera Switcher if multiple devices */}
              {cameras.length > 1 && (
                <div style={{ marginTop: '12px' }}>
                  <select
                    value={selectedCamera}
                    onChange={handleCameraChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        📹 {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alternative Upload / Manual Search */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Upload QR Image */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
              >
                <Upload size={14} /> Upload QR Photo / Screenshot
              </button>
            </div>

            {/* Manual Tag Lookup Form */}
            <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Or type Asset ID (e.g. GOV-TRN-1001)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '8px 14px' }}>
                <Search size={14} /> Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
