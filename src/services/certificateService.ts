import { logger } from '../config/logger';

/**
 * Certificate Service - Generates PDF certificates for Quran achievements
 * Types: Surah completion, Juz completion, Quran completion
 */

export interface CertificateData {
    id: string;
    studentId: string;
    studentName: string;
    type: 'surah' | 'juz' | 'quran' | 'course' | 'achievement';
    title: string;
    description: string;
    issuedAt: Date;
    issuerName: string;
    issuerTitle: string;
    details?: {
        surahNumber?: number;
        surahName?: string;
        juzNumber?: number;
        courseName?: string;
        achievementName?: string;
    };
}

// In-memory storage for certificates (replace with DB in production)
const certificatesStore: Map<string, CertificateData[]> = new Map();

export const certificateService = {
    /**
     * Generate a certificate
     */
    async generateCertificate(data: {
        studentId: string;
        studentName: string;
        type: CertificateData['type'];
        title: string;
        description: string;
        issuerName: string;
        issuerTitle: string;
        details?: CertificateData['details'];
    }): Promise<CertificateData> {
        const certificate: CertificateData = {
            id: `cert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            ...data,
            issuedAt: new Date(),
        };

        // Store certificate
        const studentCerts = certificatesStore.get(data.studentId) || [];
        studentCerts.push(certificate);
        certificatesStore.set(data.studentId, studentCerts);

        logger.info(`Certificate generated: ${certificate.id} for student ${data.studentId}`);
        return certificate;
    },

    /**
     * Get certificates for a student
     */
    async getCertificates(studentId: string): Promise<CertificateData[]> {
        return certificatesStore.get(studentId) || [];
    },

    /**
     * Get certificate by ID
     */
    async getCertificateById(certificateId: string): Promise<CertificateData | null> {
        for (const [_, certs] of certificatesStore) {
            const cert = certs.find(c => c.id === certificateId);
            if (cert) return cert;
        }
        return null;
    },

    /**
     * Generate certificate HTML content for PDF
     */
    generateCertificateHTML(certificate: CertificateData): string {
        const formattedDate = certificate.issuedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const islamicPatternSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" opacity="0.1">
        <pattern id="islamic" patternUnits="userSpaceOnUse" width="50" height="50">
          <path d="M25 0L50 12.5L25 25L0 12.5Z" fill="none" stroke="#0d6e4e" stroke-width="1"/>
          <path d="M25 25L50 37.5L25 50L0 37.5Z" fill="none" stroke="#0d6e4e" stroke-width="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#islamic)"/>
      </svg>
    `;

        const getTypeIcon = () => {
            switch (certificate.type) {
                case 'surah': return '📖';
                case 'juz': return '📚';
                case 'quran': return '👑';
                case 'course': return '🎓';
                case 'achievement': return '🏆';
                default: return '⭐';
            }
        };

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@400;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Playfair Display', serif;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
    }
    
    .certificate {
      width: 800px;
      height: 600px;
      margin: 0 auto;
      background: white;
      border: 3px solid #0d6e4e;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    
    .border-inner {
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 2px solid #c4a962;
      border-radius: 5px;
    }
    
    .corner-ornament {
      position: absolute;
      width: 60px;
      height: 60px;
      font-size: 30px;
    }
    .corner-tl { top: 20px; left: 20px; }
    .corner-tr { top: 20px; right: 20px; }
    .corner-bl { bottom: 20px; left: 20px; }
    .corner-br { bottom: 20px; right: 20px; }
    
    .content {
      position: relative;
      z-index: 1;
      padding: 60px 50px;
      text-align: center;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .header {
      margin-bottom: 20px;
    }
    
    .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    
    .school-name {
      font-size: 18px;
      color: #0d6e4e;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-weight: 700;
    }
    
    .certificate-title {
      font-size: 36px;
      color: #c4a962;
      margin: 20px 0;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 5px;
    }
    
    .awarded-to {
      font-size: 14px;
      color: #666;
      margin-top: 30px;
    }
    
    .student-name {
      font-family: 'Amiri', serif;
      font-size: 42px;
      color: #0d6e4e;
      margin: 10px 0 20px;
      font-weight: 700;
    }
    
    .achievement {
      font-size: 18px;
      color: #333;
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .details {
      margin-top: 20px;
      padding: 15px 30px;
      background: linear-gradient(90deg, transparent, #f8f9fa, transparent);
      border-radius: 5px;
      display: inline-block;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: auto;
    }
    
    .signature-block {
      text-align: center;
      min-width: 200px;
    }
    
    .signature-line {
      width: 180px;
      border-bottom: 1px solid #333;
      margin: 0 auto 10px;
    }
    
    .signature-name {
      font-size: 16px;
      font-weight: 700;
      color: #333;
    }
    
    .signature-title {
      font-size: 12px;
      color: #666;
    }
    
    .date-block {
      text-align: center;
    }
    
    .date-label {
      font-size: 12px;
      color: #666;
    }
    
    .date-value {
      font-size: 16px;
      color: #333;
      font-weight: 700;
    }
    
    .certificate-id {
      position: absolute;
      bottom: 25px;
      right: 30px;
      font-size: 10px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-inner"></div>
    <div class="corner-ornament corner-tl">✦</div>
    <div class="corner-ornament corner-tr">✦</div>
    <div class="corner-ornament corner-bl">✦</div>
    <div class="corner-ornament corner-br">✦</div>
    
    <div class="content">
      <div class="header">
        <div class="logo">${getTypeIcon()}</div>
        <div class="school-name">Tarteel Quran School</div>
        <div class="certificate-title">Certificate of Achievement</div>
      </div>
      
      <div class="main">
        <div class="awarded-to">This certifies that</div>
        <div class="student-name">${certificate.studentName}</div>
        <div class="achievement">${certificate.description}</div>
        ${certificate.details ? `
          <div class="details">
            <strong>${certificate.title}</strong>
          </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-name">${certificate.issuerName}</div>
          <div class="signature-title">${certificate.issuerTitle}</div>
        </div>
        
        <div class="date-block">
          <div class="date-label">Date of Issue</div>
          <div class="date-value">${formattedDate}</div>
        </div>
      </div>
    </div>
    
    <div class="certificate-id">ID: ${certificate.id}</div>
  </div>
</body>
</html>
    `;
    },

    /**
     * Generate Surah completion certificate
     */
    async generateSurahCertificate(
        studentId: string,
        studentName: string,
        surahNumber: number,
        surahName: string,
        issuerName: string = 'Tarteel Administration',
        issuerTitle: string = 'School Director'
    ): Promise<CertificateData> {
        return this.generateCertificate({
            studentId,
            studentName,
            type: 'surah',
            title: `Surah ${surahName} Completion`,
            description: `Has successfully memorized Surah ${surahName} (${surahNumber}) with proper Tajweed recitation.`,
            issuerName,
            issuerTitle,
            details: { surahNumber, surahName }
        });
    },

    /**
     * Generate Juz completion certificate
     */
    async generateJuzCertificate(
        studentId: string,
        studentName: string,
        juzNumber: number,
        issuerName: string = 'Tarteel Administration',
        issuerTitle: string = 'School Director'
    ): Promise<CertificateData> {
        return this.generateCertificate({
            studentId,
            studentName,
            type: 'juz',
            title: `Juz ${juzNumber} Completion`,
            description: `Has successfully memorized Juz ${juzNumber} of the Holy Quran with proper Tajweed recitation.`,
            issuerName,
            issuerTitle,
            details: { juzNumber }
        });
    },

    /**
     * Generate Quran completion certificate (Hafiz)
     */
    async generateHafizCertificate(
        studentId: string,
        studentName: string,
        issuerName: string = 'Tarteel Administration',
        issuerTitle: string = 'School Director'
    ): Promise<CertificateData> {
        return this.generateCertificate({
            studentId,
            studentName,
            type: 'quran',
            title: 'Complete Quran Memorization',
            description: 'Has successfully completed the memorization of the entire Holy Quran (30 Juz) with proper Tajweed recitation and is hereby awarded the title of Hafiz/Hafiza.',
            issuerName,
            issuerTitle,
            details: {}
        });
    }
};
