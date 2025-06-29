'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function SignInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [isSigned, setIsSigned] = useState(false);
  const [signature, setSignature] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (signature.trim() && clientName.trim() && clientEmail.trim()) {
      setIsSigned(true);
      // In a real app, you would save the signature to your database
      console.log('Invoice signed by:', { clientName, clientEmail, signature });
    }
  };

  if (isSigned) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invoice Signed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for signing the invoice. The freelancer has been notified.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Signed by:</strong> {clientName}<br />
              <strong>Email:</strong> {clientEmail}<br />
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign Invoice
        </h1>
        
        <form onSubmit={handleSign} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email *
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digital Signature *
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your name or initials as your digital signature"
            />
            <p className="text-xs text-gray-500 mt-1">
              By typing your name above, you agree to the terms and conditions of this invoice.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
          >
            Sign Invoice
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a demo signature page. In a production environment, 
            you would use a proper e-signature service like SignRequest, DocuSign, or HelloSign.
          </p>
        </div>
      </div>
    </div>
  );
} 