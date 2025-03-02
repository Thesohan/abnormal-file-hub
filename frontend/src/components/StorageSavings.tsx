import { useEffect, useState } from "react";
import { ArrowDownCircle, FileArchive } from "lucide-react";
import CountUp from "react-countup";
import { fileService } from '../services/fileService';
export const StorageSavings = () => {
  const [savings, setSavings] = useState({
    total_savings: 0,
    total_deduplicated_files: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSavings = async () => {
      const data = await fileService.getStorageSavings();
      setSavings(data);
      setLoading(false);
    };
    loadSavings();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  };

  return (
    <div className="absolute right-4 top-0 flex flex-col items-center bg-white shadow-md rounded-lg p-2 border border-gray-200">
      <h2 className="text-sm font-medium text-gray-800 flex items-center gap-1">
        <ArrowDownCircle className="text-green-600" size={16} /> Storage Savings
      </h2>

      {loading ? (
        <p className="text-gray-500 text-xs mt-1">Loading...</p>
      ) : (
        <div className="mt-1 space-y-2 text-center">
          <div className="flex items-center gap-2 p-1 bg-green-100 rounded-md text-xs">
            <ArrowDownCircle className="text-green-700" size={16} />
            <div>
              <p className="text-gray-600">Saved</p>
              <h3 className="font-bold text-green-800">
                <span className="ml-1">{formatBytes(savings.total_savings)}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-blue-100 rounded-md text-xs">
            <FileArchive className="text-blue-700" size={16} />
            <div>
              <p className="text-gray-600">Deduped</p>
              <h3 className="font-bold text-blue-800">
                <CountUp end={savings.total_deduplicated_files} duration={2} separator="," />
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageSavings;
