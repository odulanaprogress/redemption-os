import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export class QRService {
  async generateQRCode(data: any) {
    try {
      const id = uuidv4();
      const qrData = JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        id,
      });

      const qrCodeURL = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return {
        success: true,
        id,
        data: qrData,
        qrCodeURL,
      };
    } catch (error) {
      console.error('QR code generation error:', error);
      throw error;
    }
  }

  async generateQRCodeSVG(data: any): Promise<string> {
    try {
      const qrData = JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      });

      const svg = await QRCode.toString(qrData, {
        type: 'svg',
        width: 400,
        margin: 2,
      });

      return svg;
    } catch (error) {
      console.error('QR code SVG generation error:', error);
      throw error;
    }
  }

  validateQRData(qrData: string): boolean {
    try {
      const parsed = JSON.parse(qrData);
      return !!parsed.familyMemberId;
    } catch (error) {
      return false;
    }
  }
}

export const qrService = new QRService();
