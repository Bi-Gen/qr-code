'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms';

const ANALYTICS_URL = 'https://dashboard.bi-gen.it';

interface QuotaInfo {
  daily: { used: number; limit: number };
}

// Track page view
function trackPageView() {
  fetch(`${ANALYTICS_URL}/api/track/pageview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: 'qr-code',
      path: window.location.pathname,
      referrer: document.referrer
    })
  }).catch(() => {});
}

export default function QRGenerator() {
  const [activeTab, setActiveTab] = useState<QRType>('url');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);

  // Form fields
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardCompany, setVcardCompany] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Options
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  // Fetch quota (this also handles IP filtering server-side)
  const fetchQuota = async () => {
    try {
      const response = await fetch(`${ANALYTICS_URL}/api/quota/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: 'qr-code', dailyLimit: 100, monthlyLimit: 1000 })
      });
      const data = await response.json();
      if (data.daily) {
        setQuota({ daily: data.daily });
      }
    } catch {
      // Ignore quota fetch errors
    }
  };

  // Track page view and fetch quota on mount
  useEffect(() => {
    trackPageView();
    fetchQuota();
  }, []);

  const generateQRData = useCallback((): string => {
    switch (activeTab) {
      case 'url':
        return url || 'https://bi-gen.it';
      case 'text':
        return text || 'Testo di esempio';
      case 'wifi':
        return `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};;`;
      case 'vcard':
        const nameParts = vcardName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        return `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName}\nFN:${vcardName}\n${vcardCompany ? `ORG:${vcardCompany}\n` : ''}${vcardPhone ? `TEL:${vcardPhone}\n` : ''}${vcardEmail ? `EMAIL:${vcardEmail}\n` : ''}END:VCARD`;
      case 'email':
        return `mailto:${emailAddress}${emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ''}`;
      case 'phone':
        return `tel:${phoneNumber}`;
      case 'sms':
        return `sms:${smsNumber}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ''}`;
      default:
        return '';
    }
  }, [activeTab, url, text, wifiSsid, wifiPassword, wifiSecurity, vcardName, vcardPhone, vcardEmail, vcardCompany, emailAddress, emailSubject, phoneNumber, smsNumber, smsMessage]);

  useEffect(() => {
    const data = generateQRData();
    QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl).catch(console.error);

    QRCode.toString(data, {
      type: 'svg',
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: 'M',
    }).then(setQrSvg).catch(console.error);
  }, [generateQRData, size, fgColor, bgColor]);

  const trackDownload = async () => {
    try {
      await fetch(`${ANALYTICS_URL}/api/track/conversion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: 'qr-code',
          url: activeTab,
          success: true,
          duration: 0,
          fileSize: 0
        }),
      });
      // Refresh quota after download
      fetchQuota();
    } catch {}
  };

  const downloadPNG = () => {
    trackDownload();
    const link = document.createElement('a');
    link.download = `qrcode-${activeTab}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const downloadSVG = () => {
    trackDownload();
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${activeTab}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'url', label: 'URL' },
    { id: 'text', label: 'Testo' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'vcard', label: 'Contatto' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Telefono' },
    { id: 'sms', label: 'SMS' },
  ] as const;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            QR Code Generator
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Genera QR code gratuiti per URL, WiFi, contatti e altro.
            Personalizza e scarica in PNG o SVG.
          </p>
        </div>

        {/* How to use */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              <span>Scegli il tipo</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              <span>Inserisci i dati</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
              <span>Scarica PNG o SVG</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {activeTab === 'url' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://esempio.com"
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {activeTab === 'text' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Testo</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Inserisci il testo..."
                      rows={4}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                )}

                {activeTab === 'wifi' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Nome rete (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="Nome WiFi"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Password</label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="Password WiFi"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Sicurezza</label>
                      <select
                        value={wifiSecurity}
                        onChange={(e) => setWifiSecurity(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Nessuna</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'vcard' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Nome completo</label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        placeholder="Mario Rossi"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Telefono</label>
                      <input
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        placeholder="+39 123 456 7890"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        placeholder="mario@esempio.com"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Azienda (opzionale)</label>
                      <input
                        type="text"
                        value={vcardCompany}
                        onChange={(e) => setVcardCompany(e.target.value)}
                        placeholder="Nome Azienda"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Indirizzo Email</label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="esempio@email.com"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Oggetto (opzionale)</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Oggetto email"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'phone' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Numero di telefono</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+39 123 456 7890"
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {activeTab === 'sms' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Numero di telefono</label>
                      <input
                        type="tel"
                        value={smsNumber}
                        onChange={(e) => setSmsNumber(e.target.value)}
                        placeholder="+39 123 456 7890"
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Messaggio (opzionale)</label>
                      <textarea
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        placeholder="Testo del messaggio..."
                        rows={3}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Options Toggle */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${showOptions ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Personalizzazione
                </button>
              </div>

              {/* Options Panel */}
              {showOptions && (
                <div className="mt-4 p-4 bg-gray-900/30 rounded-xl border border-gray-700 space-y-4 overflow-hidden">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label className="block text-sm text-gray-400 mb-2">Colore QR</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer flex-shrink-0 border-0 p-0"
                        />
                        <input
                          type="text"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-full min-w-0 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm text-gray-400 mb-2">Sfondo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer flex-shrink-0 border-0 p-0"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full min-w-0 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Dimensione: {size}px</label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="64"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-400 mb-4">Anteprima</p>

              {/* QR Preview */}
              <div
                className="rounded-xl p-4 mb-6"
                style={{ backgroundColor: bgColor }}
              >
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="max-w-full"
                    style={{ width: Math.min(size, 250), height: Math.min(size, 250) }}
                  />
                )}
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={downloadPNG}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PNG
                </button>
                <button
                  onClick={downloadSVG}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  SVG
                </button>
              </div>

              {/* Quota info */}
              {quota && (
                <p className="text-xs text-gray-500 mt-4">
                  {quota.daily.used} QR generati oggi
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-white mb-1">100% Gratuito</h3>
              <p className="text-sm text-gray-400">Nessun limite, nessuna registrazione</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold text-white mb-1">Privacy First</h3>
              <p className="text-sm text-gray-400">I dati non lasciano il tuo browser</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold text-white mb-1">Personalizzabile</h3>
              <p className="text-sm text-gray-400">Colori e dimensioni a piacere</p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Powered by{' '}
              <a
                href="https://bi-gen.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                BI-Gen
              </a>
              {' '}•{' '}
              <a
                href="https://bi-gen.it/tools"
                className="text-blue-400 hover:text-blue-300"
              >
                Altri tool gratuiti
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
