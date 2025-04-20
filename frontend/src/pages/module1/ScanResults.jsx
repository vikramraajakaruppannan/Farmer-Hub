import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const ScanResults = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cardRef = useRef(null);
  const [results, setResults] = useState(state?.results || []);
  const [errors, setErrors] = useState(state?.errors || []);
  const [plantInputs, setPlantInputs] = useState({});

  // Load results from localStorage if state is empty
  useEffect(() => {
    if (!state?.results || state.results.length === 0) {
      const storedResults = localStorage.getItem('scan_results');
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      }
    }
    if (!state?.errors) {
      setErrors([]);
    }
  }, [state]);

  const handlePlantNameSubmit = async (index, plantName) => {
    if (!plantName.trim()) return;
    const updatedResults = [...results];
    const result = updatedResults[index];

    // Update diseases with new prevention methods
    const updatedDiseases = await Promise.all(
      result.diseases.map(async (disease) => {
        try {
          const response = await axios.post('http://localhost:8000/update-plant-name', {
            plant_name: plantName,
            disease_name: disease.name,
          }, {
            headers: { 'X-Session-ID': localStorage.getItem('session_id') },
          });
          return { ...disease, prevention: response.data.prevention };
        } catch (e) {
          return disease;
        }
      })
    );

    updatedResults[index] = { ...result, plant_name: plantName, diseases: updatedDiseases };
    setResults(updatedResults);
    localStorage.setItem('scan_results', JSON.stringify(updatedResults));
    setPlantInputs({ ...plantInputs, [index]: '' });
  };

  const handleDownloadPDF = async () => {
    const card = cardRef.current;
    if (!card) return;

    const canvas = await html2canvas(card, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save('scan-results.pdf');
  };

  const handleReScan = () => {
    navigate('/disease-detection');
  };

  const handleApplyTreatment = () => {
    navigate('/feedback');
  };

  // Clean prevention text to four numbered sentences
  const formatPrevention = (prevention) => {
    if (!prevention) {
      return [
        "1. Apply neem oil to affected areas as an organic treatment.",
        "2. Use a fungicide like chlorothalonil for chemical control.",
        "3. Prune infected branches to improve cultural practices.",
        "4. Ensure good air circulation around the plant.",
      ];
    }
    const lines = prevention
      .split('\n')
      .map((line) =>
        line
          .replace(/^\-\s*|\*\s*|\**\s*/, '') // Remove -, *, or **
          .replace(/\[.*?\]|\(.*?\)/g, '') // Remove markdown links/parentheses
          .trim()
      )
      .filter((line) => line)
      .slice(0, 4);
    // Pad with defaults if fewer than 4
    const defaults = [
      "Apply neem oil to affected areas as an organic treatment.",
      "Use a fungicide like chlorothalonil for chemical control.",
      "Prune infected branches to improve cultural practices.",
      "Ensure good air circulation around the plant.",
    ];
    while (lines.length < 4) {
      lines.push(defaults[lines.length]);
    }
    return lines.map((line, i) => `${i + 1}. ${line.charAt(0).toUpperCase() + line.slice(1)}`);
  };

  return (
    <div className="min-h-screen bg-agritech-paleGreen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/disease-detection" className="text-gray-700 hover:text-gray-900 mr-3">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Scan Results</h1>
          </div>
          {results.length > 0 && (
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </button>
          )}
        </div>

        <Card ref={cardRef} className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardContent className="p-8">
            {errors.length > 0 && (
              <div className="mb-6 bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-800 font-medium">
                  Some images could not be analyzed:
                </p>
                <ul className="list-disc pl-5 text-yellow-800 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.length === 0 ? (
              <p className="text-gray-600 text-center">
                No results available. Please try scanning again with clear images of plant leaves.
              </p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-8">
                  {result.plant_name && result.plant_name !== 'Unknown' ? (
                    <h2 className="text-xl font-semibold mb-4">{result.plant_name}</h2>
                  ) : (
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">Plant not identified. Please enter the plant name:</p>
                      <input
                        type="text"
                        className="p-2 border rounded w-full max-w-xs"
                        placeholder="e.g., Tomato"
                        value={plantInputs[index] || ''}
                        onChange={(e) => setPlantInputs({ ...plantInputs, [index]: e.target.value })}
                      />
                      <button
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                        onClick={() => handlePlantNameSubmit(index, plantInputs[index])}
                        disabled={!plantInputs[index]?.trim()}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                  <div className="mb-6 bg-blue-50 p-4 rounded-md flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1 text-gray-900 font-medium">
                      Healthy: {result.healthy ? 'Yes' : 'No'} (
                      {(result.healthy_probability * 100).toFixed(1)}% confidence)
                    </div>
                  </div>

                  {result.diseases.length > 0 ? (
                    result.diseases.map((disease, dIndex) => (
                      <div key={dIndex} className="mb-8">
                        <div className="mb-6 bg-red-50 p-4 rounded-md flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                            <div className="text-gray-900 font-medium">
                              Diagnosed with {disease.name}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${disease.probability * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-600">
                              {(disease.probability * 100).toFixed(1)}% Confidence
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start mb-4">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <h3 className="font-semibold text-gray-900">Prevention & Treatment</h3>
                                <p className="text-sm text-gray-600">Recommended solutions</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700">
                              {formatPrevention(disease.prevention).map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-green-600 font-medium">No diseases detected.</p>
                  )}
                </div>
              ))
            )}

            <div className="flex space-x-4 mt-8 justify-center">
              <button
                onClick={handleApplyTreatment}
                className="px-6 py-3 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors"
              >
                Apply Treatment
              </button>
              <button
                onClick={handleReScan}
                className="px-6 py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-900 transition-colors"
              >
                Re-Scan
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanResults;