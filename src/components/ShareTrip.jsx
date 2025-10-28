import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Mail, MessageCircle, Phone, Copy, Check } from 'lucide-react';

const ShareTrip = ({ tripDetails, tripState, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const generateShareMessage = () => {
    const baseMessage = t('followMeHome.share.message', {
      riskLevel: t(`followMeHome.setup.riskLevel.${tripDetails?.riskLevel}.label`),
      eta: tripDetails?.eta,
      status: tripState === 'active' ? t('followMeHome.share.statusActive') : t('followMeHome.share.statusEnded')
    });

    return baseMessage;
  };

  const generateShareLink = () => {
    // Generate a unique shareable link for the trip
    const tripId = Date.now().toString(36);
    const baseUrl = window.location.origin;
    return `${baseUrl}/follow-me-home/share/${tripId}`;
  };

  const handleEmailShare = () => {
    const subject = t('followMeHome.share.emailSubject');
    const body = generateShareMessage();
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const handleWhatsAppShare = () => {
    const message = generateShareMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMShare = () => {
    const message = generateShareMessage();
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
  };

  const handleCopyLink = async () => {
    const shareLink = generateShareLink();
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareOptions = [
    {
      id: 'email',
      label: t('followMeHome.share.email'),
      icon: Mail,
      action: handleEmailShare,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'whatsapp',
      label: t('followMeHome.share.whatsapp'),
      icon: MessageCircle,
      action: handleWhatsAppShare,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'sms',
      label: t('followMeHome.share.sms'),
      icon: Phone,
      action: handleSMShare,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'link',
      label: t('followMeHome.share.link'),
      icon: copied ? Check : Copy,
      action: handleCopyLink,
      color: copied ? 'bg-green-500' : 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Share2 className="mr-2" />
              {t('followMeHome.share.title')}
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
              ×
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('followMeHome.share.description')}
          </p>

          <div className="space-y-3">
            {shareOptions.map(option => (
              <button
                key={option.id}
                onClick={option.action}
                className={`w-full flex items-center p-4 rounded-lg text-white transition-colors ${option.color}`}
              >
                <option.icon className="mr-3 h-5 w-5" />
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('followMeHome.share.preview')}:
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {generateShareMessage()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTrip;
