import React from 'react';
import { X, Ruler, Info } from 'lucide-react';

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
  category: string; // Changed to accept any string
}

interface SizeData {
  title: string;
  measurements: Record<string, string>[];
  headers: string[];
  tips: string[];
}

const SizeChart: React.FC<SizeChartProps> = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  // Dynamic size data based on category
  const getSizeData = (): SizeData => {
    const lowerCategory = category.toLowerCase();

    // Default data structure
    const defaultData: SizeData = {
      title: `${category} Size Chart`,
      measurements: [],
      headers: ["Size", "Measurements"],
      tips: [
        "Measure your body according to standard sizing guidelines",
        "Compare your measurements to the chart below",
        "Contact support if you need help with sizing",
      ],
    };

    // Add specific data for known categories
    if (lowerCategory.includes("men")) {
      return {
        ...defaultData,
        title: "Men's Size Chart",
        measurements: [
          {
            size: "S",
            chest: "36-38",
            waist: "30-32",
            length: "27",
            shoulder: "17",
          },
          {
            size: "M",
            chest: "38-40",
            waist: "32-34",
            length: "28",
            shoulder: "18",
          },
          {
            size: "L",
            chest: "40-42",
            waist: "34-36",
            length: "29",
            shoulder: "19",
          },
          {
            size: "XL",
            chest: "42-44",
            waist: "36-38",
            length: "30",
            shoulder: "20",
          },
        ],
        headers: [
          "Size",
          "Chest (inches)",
          "Waist (inches)",
          "Length (inches)",
          "Shoulder (inches)",
        ],
        tips: [
          "Measure your chest at the fullest part",
          "Measure your waist at the narrowest point",
          "For length, measure from shoulder to hem",
        ],
      };
    }

    if (lowerCategory.includes("women") || lowerCategory.includes("female")) {
      return {
        ...defaultData,
        title: "Women's Size Chart",
        measurements: [
          {
            size: "XS",
            chest: "32-34",
            waist: "24-26",
            hips: "34-36",
            length: "25",
          },
          {
            size: "S",
            chest: "34-36",
            waist: "26-28",
            hips: "36-38",
            length: "26",
          },
          {
            size: "M",
            chest: "36-38",
            waist: "28-30",
            hips: "38-40",
            length: "27",
          },
          {
            size: "L",
            chest: "38-40",
            waist: "30-32",
            hips: "40-42",
            length: "28",
          },
        ],
        headers: [
          "Size",
          "Bust (inches)",
          "Waist (inches)",
          "Hips (inches)",
          "Length (inches)",
        ],
        tips: [
          "Measure your bust at the fullest part",
          "Measure your waist at the narrowest point",
          "Measure your hips at the fullest part",
        ],
      };
    }

    if (lowerCategory.includes("kid") || lowerCategory.includes("child")) {
      return {
        ...defaultData,
        title: "Kids Size Chart",
        measurements: [
          {
            size: "2-3Y",
            chest: "20-21",
            waist: "19-20",
            height: "35-38",
            age: "2-3 years",
          },
          {
            size: "4-5Y",
            chest: "22-23",
            waist: "20-21",
            height: "39-42",
            age: "4-5 years",
          },
          {
            size: "6-7Y",
            chest: "24-25",
            waist: "21-22",
            height: "43-46",
            age: "6-7 years",
          },
        ],
        headers: [
          "Size",
          "Chest (inches)",
          "Waist (inches)",
          "Height (inches)",
          "Age",
        ],
        tips: [
          "Measure chest around the fullest part",
          "Measure waist at the natural waistline",
          "Height should be measured without shoes",
        ],
      };
    }

    // Fallback for unknown categories
    return {
      ...defaultData,
      measurements: [
        { size: "S", measurement: "See product description" },
        { size: "M", measurement: "See product description" },
        { size: "L", measurement: "See product description" },
        { size: "XL", measurement: "See product description" },
      ],
    };
  };

  const currentData = getSizeData();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-6xl bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-black px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                              
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6 max-h-[80vh] overflow-y-auto">
            {/* Size Chart Table */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      {currentData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 border-b-2 border-gray-200 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.measurements.map((measurement, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-indigo-50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3 font-semibold text-indigo-600 border-b border-gray-200 whitespace-nowrap">
                          {measurement.size}
                        </td>
                        {Object.entries(measurement)
                          .slice(1)
                          .map(([key, value], idx) => (
                            <td
                              key={idx}
                              className="px-3 sm:px-4 py-3 text-gray-700 border-b border-gray-200 text-sm whitespace-nowrap"
                            >
                              {value}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Measurement Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* How to Measure */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    How to Measure
                  </h4>
                </div>
                <div className="space-y-3">
                  {currentData.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Guide */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Measurement Guide
                </h4>
                <div className="bg-gradient-to-br from-black-50 to-black-50 rounded-xl p-6">
                  <div className="text-center space-y-4">
                    {/* Simple illustration placeholder */}
                    <div className="w-24 h-32 sm:w-32 sm:h-40 mx-auto bg-gradient-to-b from-indigo-200 to-black-200 rounded-lg flex items-center justify-center">
                      <Ruler className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600" />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="font-medium">Measurement Tips:</p>
                      <p>• Use a soft measuring tape</p>
                      <p>• Measure over light clothing</p>
                      <p>• Keep tape parallel to floor</p>
                      <p>• Don't pull tape too tight</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Size Recommendations */}
            <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-2">
                  <h5 className="font-semibold text-amber-900">
                    Size Recommendations
                  </h5>
                  <div className="text-sm text-amber-800 space-y-1">
                    <p>
                      • If you're between sizes, we recommend sizing up for a
                      comfortable fit
                    </p>
                    <p>• For a fitted look, choose your exact measurements</p>
                    <p>
                      • Contact our support team if you need personalized sizing
                      advice
                    </p>
                    <p>
                      • All measurements may vary by ±0.5 inches due to
                      manufacturing tolerances
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
            </div>
          </div>
        </div>
      </div>
   
  );
};

export default SizeChart;