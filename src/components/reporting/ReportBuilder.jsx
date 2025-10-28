import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

/**
 * Report Builder Component
 * UI for generating custom family reports with:
 * - Multiple report templates
 * - Export formats (CSV, JSON)
 * - Date range filtering
 * - Data preview
 */
export default function ReportBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState('summary');
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportTemplates = [
    { id: 'summary', name: 'Family Summary', description: 'Overview of all family members and statistics' },
    { id: 'members', name: 'Member Details', description: 'Detailed information about family members' },
    { id: 'events', name: 'Event Timeline', description: 'Complete family event history' },
    { id: 'birthdays', name: 'Birthday Calendar', description: 'All family member birthdays' },
    { id: 'anniversaries', name: 'Anniversaries', description: 'All anniversary events' },
    { id: 'emergency', name: 'Emergency Contacts', description: 'Emergency contact information' },
  ];

  const handleGenerateReport = () => {
    const config = {
      template: selectedTemplate,
      format: exportFormat,
      dateRange,
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
    };
    console.log('Generate report with config:', config);
    // Report generation logic would go here
    alert(`Report generated: ${selectedTemplate} (${exportFormat})`);
  };

  const handleDownloadTemplate = () => {
    const template = reportTemplates.find(t => t.id === selectedTemplate);
    console.log('Download template:', template);
    alert(`Downloading ${template.name} report template...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Report Builder</h2>
        <p className="text-gray-600">Create custom family reports and export data</p>
      </div>

      {/* Report Template Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Select Report Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                selectedTemplate === template.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Format */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Export Format</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">CSV (Excel compatible)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">JSON (Data format)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="pdf"
                checked={exportFormat === 'pdf'}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">PDF (Printable)</span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Date Range</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="all"
                checked={dateRange === 'all'}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">All Time</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="year"
                checked={dateRange === 'year'}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">This Year</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="month"
                checked={dateRange === 'month'}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">This Month</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="custom"
                checked={dateRange === 'custom'}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">Custom Range</span>
            </label>

            {dateRange === 'custom' && (
              <div className="ml-7 space-y-2 mt-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="End date"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={handleGenerateReport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Generate & Download
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Report Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Reports include all family members and events from your account</li>
          <li>✓ Data is processed locally and not stored on our servers</li>
          <li>✓ You can customize the date range for more specific reports</li>
          <li>✓ Exported files can be imported into other applications</li>
        </ul>
      </div>
    </div>
  );
}
