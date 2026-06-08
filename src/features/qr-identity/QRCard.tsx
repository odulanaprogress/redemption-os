import { useEffect, useState } from 'react';
import { QrCode, Download, Printer } from 'lucide-react';
import { FamilyMember, QRTag } from '../../types';
import { familyService } from '../../services/family.service';
import { toast } from 'sonner';

interface QRCardProps {
  familyMember: FamilyMember;
}

export const QRCard = ({ familyMember }: QRCardProps) => {
  const [qrTag, setQrTag] = useState<QRTag | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQRTag();
  }, [familyMember.id]);

  const loadQRTag = async () => {
    setIsLoading(true);
    try {
      const tag = await familyService.getQRTag(familyMember.id);
      setQrTag(tag);
    } catch (error) {
      toast.error('Failed to load QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrTag) return;

    const link = document.createElement('a');
    link.href = qrTag.qrCodeURL;
    link.download = `${familyMember.firstName}-${familyMember.lastName}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const handlePrint = () => {
    if (!qrTag) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Tag - ${familyMember.firstName} ${familyMember.lastName}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .qr-card {
                border: 2px solid #000;
                padding: 30px;
                text-align: center;
                max-width: 400px;
              }
              .name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
              }
              .qr-code {
                margin: 20px 0;
              }
              .info {
                font-size: 14px;
                margin-top: 20px;
                text-align: left;
              }
              .info-row {
                margin: 8px 0;
              }
              .label {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="qr-card">
              <div class="name">${familyMember.firstName} ${familyMember.lastName}</div>
              <div class="qr-code">
                <img src="${qrTag.qrCodeURL}" alt="QR Code" style="width: 300px; height: 300px;" />
              </div>
              <div class="info">
                ${familyMember.assignedZone ? `<div class="info-row"><span class="label">Zone:</span> ${familyMember.assignedZone}</div>` : ''}
                ${familyMember.allergies && familyMember.allergies.length > 0 ? `<div class="info-row"><span class="label">Allergies:</span> ${familyMember.allergies.join(', ')}</div>` : ''}
                <div class="info-row"><span class="label">Emergency Contact:</span> ${familyMember.emergencyContact.name} - ${familyMember.emergencyContact.phoneNumber}</div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!qrTag) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <QrCode className="w-12 h-12 text-white/40" />
          <p className="text-white/60">QR code not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          {familyMember.firstName} {familyMember.lastName}
        </h3>
        {familyMember.assignedZone && (
          <p className="text-emerald-400 text-sm mb-4">Zone: {familyMember.assignedZone}</p>
        )}

        <div className="bg-white p-4 rounded-lg inline-block mb-6">
          <img
            src={qrTag.qrCodeURL}
            alt="QR Code"
            className="w-64 h-64"
          />
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Tag
          </button>
        </div>

        {familyMember.allergies && familyMember.allergies.length > 0 && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm font-medium">
              Allergies: {familyMember.allergies.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
