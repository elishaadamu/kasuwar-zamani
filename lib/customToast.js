import { toast } from "react-toastify";
import { FiCheckCircle, FiInfo, FiXCircle, FiAlertTriangle } from "react-icons/fi";

const CustomToastContent = ({ title, subtext, type }) => {
  const configs = {
    success: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      icon: <FiCheckCircle className="text-lg" />,
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-600",
      icon: <FiXCircle className="text-lg" />,
    },
    info: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      icon: <FiInfo className="text-lg" />,
    },
    warn: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      icon: <FiAlertTriangle className="text-lg" />,
    },
  };

  const config = configs[type] || configs.info;

  return (
    <div className="flex items-start gap-3 p-1">
      <div className="flex-shrink-0 mt-0.5">
        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center ${config.text}`}>
          {config.icon}
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        {subtext && (
          <p className="text-xs font-medium text-gray-500 mt-0.5">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

const toastConfig = {
  icon: false,
  hideProgressBar: true,
  className: "rounded-2xl border border-gray-100 shadow-xl p-4",
};

export const customToast = {
  success: (title, subtext) => {
    const mainTitle = subtext ? title : "Success";
    const desc = subtext || title;
    toast.success(<CustomToastContent title={mainTitle} subtext={desc} type="success" />, toastConfig);
  },
  error: (title, subtext) => {
    const mainTitle = subtext ? title : "Action Failed";
    const desc = subtext || title;
    toast.error(<CustomToastContent title={mainTitle} subtext={desc} type="error" />, toastConfig);
  },
  info: (title, subtext) => {
    const mainTitle = subtext ? title : "Information";
    const desc = subtext || title;
    toast.info(<CustomToastContent title={mainTitle} subtext={desc} type="info" />, toastConfig);
  },
  warn: (title, subtext) => {
    const mainTitle = subtext ? title : "Warning";
    const desc = subtext || title;
    toast.warn(<CustomToastContent title={mainTitle} subtext={desc} type="warn" />, toastConfig);
  },
};
