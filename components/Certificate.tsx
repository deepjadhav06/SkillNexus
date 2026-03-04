import React from 'react';
import { Certificate as CertificateType } from '../types';

interface CertificateProps {
  certificate: CertificateType;
  onDownload?: () => void;
  onClose?: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ certificate, onDownload, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const generateCertificateId = () => {
    return certificate.certificateId || `CERT-${Date.now()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Certificate Content */}
        <div className="p-12 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl"></div>

          {/* Certificate */}
          <div className="relative bg-white border-4 border-blue-600 rounded-lg p-12 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-sm tracking-widest text-blue-600 font-semibold mb-2">SKILLNEXUS</div>
              <h1 className="text-5xl font-bold text-blue-900 mb-2">CERTIFICATE</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto"></div>
              <p className="text-gray-600 text-sm mt-2">OF COMPLETION</p>
            </div>

            {/* Main Text */}
            <div className="text-center mb-12 border-t-2 border-b-2 border-blue-200 py-6">
              <p className="text-gray-700 text-lg mb-6">WE PROUDLY PRESENT THIS CERTIFICATE TO</p>
              <h2 className="text-4xl font-bold text-blue-900 mb-6 italic">{certificate.userName}</h2>
              <p className="text-gray-700">
                for successfully completing the course
                <br />
                <span className="font-bold text-lg text-blue-900">{certificate.skillName}</span>
              </p>
              {certificate.score && (
                <p className="text-gray-600 mt-4 text-sm">Score: {certificate.score}%</p>
              )}
            </div>

            {/* Footer */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="mb-8">
                  {/* Signature placeholder */}
                  <div className="w-20 h-12 border-t-2 border-gray-800 mx-auto mb-2"></div>
                </div>
                <p className="font-semibold text-gray-800">SkillNexus Admin</p>
                <p className="text-gray-600">Issued By</p>
              </div>
              <div className="text-gray-700">
                <p className="font-semibold">Issued Date</p>
                <p>{certificate.issuedDate}</p>
              </div>
              <div className="text-gray-700">
                <p className="font-semibold">Certificate ID</p>
                <p className="text-xs">{generateCertificateId()}</p>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="mt-8 pt-4 border-t border-blue-200">
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Print Certificate
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
