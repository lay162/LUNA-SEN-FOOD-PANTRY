import React, { useState } from 'react';

const QRCodeGenerator = () => {
  const [qrInput, setQrInput] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [qrType, setQrType] = useState('family-code');

  const qrTypes = [
    { id: 'family-code', name: 'Family Code', prefix: 'FAM-' },
    { id: 'stock-item', name: 'Stock Item', prefix: 'ITEM-' },
    { id: 'delivery-route', name: 'Delivery Route', prefix: 'ROUTE-' },
    { id: 'volunteer-id', name: 'Volunteer ID', prefix: 'VOL-' },
    { id: 'referral', name: 'Referral', prefix: 'REF-' }
  ];

  const generateQRCode = () => {
    const selectedType = qrTypes.find(type => type.id === qrType);
    const qrData = {
      type: qrType,
      code: qrInput.startsWith(selectedType.prefix) ? qrInput : `${selectedType.prefix}${qrInput}`,
      timestamp: new Date().toISOString(),
      system: 'LUNA-SEN-PANTRY'
    };
    
    // In a real implementation, you would use a QR code library like qrcode-generator
    // For now, we'll simulate the QR code generation
    const qrString = JSON.stringify(qrData);
    setGeneratedQR(qrString);
  };

  const printQRCode = () => {
    // Simulate printing functionality
    window.print();
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(generatedQR);
  };

  return (
    <div className="luna-page">
      <div className="luna-card luna-card--primary mb-8">
        <div className="p-6">
          <h1 className="luna-text-gradient text-3xl font-bold mb-2">
            QR Code Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate QR codes for families, stock items, and admin functions
          </p>
        </div>
      </div>

      <div className="luna-card-grid luna-card-grid--2-col">
        {/* QR Generator Form */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Generate New QR Code</h2>
            
            <div className="space-y-4">
              {/* QR Type Selection */}
              <div>
                <label className="luna-form-label">QR Code Type</label>
                <select 
                  className="luna-form-select"
                  value={qrType}
                  onChange={(e) => setQrType(e.target.value)}
                >
                  {qrTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.prefix})
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Field */}
              <div>
                <label className="luna-form-label">
                  Code/ID {qrTypes.find(t => t.id === qrType)?.prefix && 
                    `(will be prefixed with ${qrTypes.find(t => t.id === qrType)?.prefix})`}
                </label>
                <input
                  type="text"
                  className="luna-form-input"
                  placeholder="Enter code or ID..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <button 
                onClick={generateQRCode}
                className="luna-button luna-button--gradient w-full"
                disabled={!qrInput.trim()}
              >
                Generate QR Code
              </button>
            </div>
          </div>
        </div>

        {/* QR Preview and Actions */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">QR Code Preview</h2>
            
            {generatedQR ? (
              <div className="space-y-4">
                {/* QR Code Placeholder */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-sm text-gray-600">QR Code</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {JSON.parse(generatedQR).code}
                      </p>
                    </div>
                  </div>
                  
                  {/* QR Data Preview */}
                  <div className="text-left bg-gray-50 p-3 rounded text-xs">
                    <strong>QR Data:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(generatedQR), null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button 
                    onClick={printQRCode}
                    className="luna-button luna-button--primary w-full"
                  >
                    🖨️ Print QR Code
                  </button>
                  
                  <button 
                    onClick={copyQRData}
                    className="luna-button luna-button--secondary w-full"
                  >
                    📋 Copy QR Data
                  </button>
                  
                  <button 
                    onClick={() => setGeneratedQR('')}
                    className="luna-button luna-button--outline w-full"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-500">No QR code generated yet.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Enter a code and click "Generate QR Code" to create one.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* QR Scanner Simulation */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">QR Code Scanner</h2>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-600 mb-4">Scan QR codes with your device camera</p>
              
              <button className="luna-button luna-button--gradient">
                📱 Open Camera Scanner
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  Or manually enter QR data:
                </p>
                <textarea
                  className="luna-form-textarea"
                  placeholder="Paste QR code data here..."
                  rows="4"
                />
                <button className="luna-button luna-button--outline w-full mt-3">
                  Process QR Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick QR Codes */}
        <div className="luna-card">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick QR Codes</h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => {setQrType('family-code'); setQrInput(''); generateQRCode();}}
                className="luna-button luna-button--outline w-full text-left"
              >
                👨‍👩‍👧‍👦 Family Code (enter a real code)
              </button>
              
              <button 
                onClick={() => {setQrType('stock-item'); setQrInput(''); generateQRCode();}}
                className="luna-button luna-button--outline w-full text-left"
              >
                📦 Stock Item (enter a real SKU / item code)
              </button>
              
              <button 
                onClick={() => {setQrType('delivery-route'); setQrInput(''); generateQRCode();}}
                className="luna-button luna-button--outline w-full text-left"
              >
                🚚 Delivery Route (enter a real route ID)
              </button>
              
              <button 
                onClick={() => {setQrType('volunteer-id'); setQrInput(''); generateQRCode();}}
                className="luna-button luna-button--outline w-full text-left"
              >
                👥 Volunteer ID (enter a real ID)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;