import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Download } from 'lucide-react';

const EventLinksModal = ({ event, onClose }) => {
  const [qrPublic, setQrPublic] = useState('');
  const [qrPrivate, setQrPrivate] = useState('');

  useEffect(() => {
    if (event.links) {
      QRCode.toDataURL(event.links.public).then(setQrPublic);
      QRCode.toDataURL(event.links.private).then(setQrPrivate);
    }
  }, [event.links]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const downloadQR = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Event Links & QR Codes</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
          </div>

          <div className="space-y-6">
            {/* Public Link */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Public Link</h4>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={event.links?.public || ''}
                  readOnly
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button
                  onClick={() => copyToClipboard(event.links?.public)}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {qrPublic && (
                <div className="flex flex-col items-center">
                  <img src={qrPublic} alt="Public QR Code" className="w-32 h-32 mb-2" />
                  <button
                    onClick={() => downloadQR(qrPublic, `${event.title}_public_qr.png`)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <Download className="h-3 w-3" />
                    Download QR
                  </button>
                </div>
              )}
            </div>

            {/* Private Link */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Private Link (Invite Only)</h4>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={event.links?.private || ''}
                  readOnly
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button
                  onClick={() => copyToClipboard(event.links?.private)}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {qrPrivate && (
                <div className="flex flex-col items-center">
                  <img src={qrPrivate} alt="Private QR Code" className="w-32 h-32 mb-2" />
                  <button
                    onClick={() => downloadQR(qrPrivate, `${event.title}_private_qr.png`)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Download className="h-3 w-3" />
                    Download QR
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Sharing Instructions</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Public link can be shared freely - anyone can view event details</li>
              <li>• Private link requires invitation - use for controlled access</li>
              <li>• QR codes can be printed or displayed for easy mobile access</li>
              <li>• Links remain active until event sharing is terminated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLinksModal;