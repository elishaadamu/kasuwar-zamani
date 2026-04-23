"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { API_CONFIG, apiUrl } from "@/configs/api";
import Loading from "@/components/Loading";
import { customToast } from "@/lib/customToast";
import { decryptData } from "@/lib/encryption";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";
import { 
  FaTimesCircle, 
  FaUpload, 
  FaTrash, 
  FaBoxOpen, 
  FaCrown, 
  FaMapMarkerAlt, 
  FaInfoCircle,
  FaImage,
  FaArrowRight,
  FaRocket
} from "react-icons/fa";
import axios from "axios";

const AddProduct = () => {
  const { router, userData, authLoading } = useAppContext();
  const [images, setImages] = useState(new Array(4).fill(null));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [state, setState] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [condition, setCondition] = useState("NEW");
  const [stock, setStock] = useState("");
  const [commission, setCommission] = useState("");
  const [pickupState, setPickupState] = useState("");
  const [pickupLga, setPickupLga] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLgas, setPickupLgas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState("");
  const [subscriptionInvalid, setSubscriptionInvalid] = useState(false);
  const [states] = useState(statesData.state);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL));
        setCategories(response.data.categories || []);
        if (response.data.categories?.length > 0) {
          setCategory(response.data.categories[0].name);
        }
      } catch (error) {
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (pickupState) {
      const lgasForState = lgasData[pickupState] || [];
      setPickupLgas(lgasForState);
      setPickupLga("");
    } else {
      setPickupLgas([]);
      setPickupLga("");
    }
  }, [pickupState]);

  useEffect(() => {
    if (!userData?.id && !userData?._id) return;
    const uid = userData?.id || userData?._id;

    const checkSubscriptionStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CHECK_STATUS + uid));
        const canPost = response.data?.canPostProduct;
        setSubscriptionInvalid(!canPost);

        if (!canPost) {
          setError("Your subscription does not allow adding products. Upgrade for limitless intake.");
        } else {
          const detailsResponse = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.GET_DETAILS + uid));
          if (detailsResponse.data.success) {
            setSubscription(detailsResponse.data.subscription);
          }
        }
      } catch (err) {
        setSubscriptionInvalid(true);
        setError("Protocol failed to verify subscription status.");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkSubscriptionStatus();
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.filter(Boolean).length === 0) {
      customToast.error("Visual Required", "Please provide at least one product visual.");
      return;
    }

    setLoading(true);
    try {
      const encryptedUser = localStorage.getItem("user");
      const du = decryptData(encryptedUser);
      const userId = du?.id || du?._id;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", parseFloat(price));
      formData.append("state", state);
      formData.append("minOrder", parseInt(minOrder) || 1);
      formData.append("condition", condition);
      formData.append("stock", parseInt(stock) || 0);
      formData.append("commission", parseFloat(commission) || 0);
      formData.append("pickupState", pickupState);
      formData.append("pickupLga", pickupLga);
      formData.append("pickupAddress", pickupAddress);

      images.filter(Boolean).forEach((img) => formData.append("images", img));

      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.ADD + userId), formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      customToast.success("Success", "Asset cataloged successfully!");
      router.push("/vendor-dashboard/products-list");
    } catch (err) {
      customToast.error("Ingestion Failure", err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file && file.size < 5 * 1024 * 1024) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    } else if (file) {
      customToast.warn("File Rejected", "File exceeds 5MB limit.");
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  if (isCheckingStatus || authLoading) return <Loading fullScreen={false} />;

  if (subscriptionInvalid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl shadow-rose-900/5 max-w-md animate-scaleIn">
          <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <FaTimesCircle className="text-rose-500 text-4xl" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Access Restricted</h3>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/vendor-dashboard/subscription-plans")}
            className="w-full bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] px-8 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Authorize Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Vendor Inventory Intake
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Add New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Product</span>
          </h1>
          <p className="mt-3 text-gray-500 font-medium text-lg">
            Catalog your assets in the global marketplace and reach millions of buyers.
          </p>
        </div>
        
        {subscription && (
           <div className="bg-gray-900 rounded-[1.5rem] p-6 text-white min-w-[300px] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-1000"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 font-mono">Current Engine</p>
                  <p className="text-xl font-black">{subscription.plan.package}</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                  <FaCrown />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-400">Allowance: {subscription.plan.products >= 1000 ? "Limitless" : subscription.plan.products}</span>
                <button onClick={() => router.push("/vendor-dashboard/subscription-plans")} className="text-blue-400 hover:text-white transition">Upgrade</button>
              </div>
           </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Product Visuals */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                 <FaImage />
               </div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Visual Assets</h3>
             </div>

             <div className="grid grid-cols-2 gap-4">
               {images.map((image, index) => (
                 <div key={index} className="relative aspect-square">
                   <label
                     htmlFor={`upload-${index}`}
                     className={`flex flex-col items-center justify-center h-full border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all overflow-hidden relative group
                       ${image ? "border-blue-500 bg-blue-50/10" : "border-gray-100 hover:border-blue-400 bg-gray-50/50 hover:bg-white"}`}
                   >
                     <input id={`upload-${index}`} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, index)} />
                     {image ? (
                        <>
                          <Image src={URL.createObjectURL(image)} alt={`Visual ${index + 1}`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button type="button" onClick={(e) => { e.preventDefault(); handleRemoveImage(index); }} className="w-10 h-10 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all">
                               <FaTrash className="mx-auto" />
                             </button>
                          </div>
                        </>
                     ) : (
                       <div className="text-center p-4">
                         <FaUpload className="text-gray-300 text-2xl mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Intake {index + 1}</span>
                       </div>
                     )}
                   </label>
                 </div>
               ))}
             </div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 text-center">Max Payload: 4 x 5MB Images</p>
           </div>

           <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/10 group">
              <h4 className="text-2xl font-black mb-4 tracking-tight">Need Expert Help?</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">Our fulfillment team can assist in cataloging large inventories for professional presentation.</p>
              <button type="button" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] bg-white text-gray-900 px-6 py-3 rounded-xl hover:gap-4 transition-all">
                Support Hub <FaArrowRight />
              </button>
           </div>
        </div>

        {/* Right: Asset Properties */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Core Identification */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><FaBoxOpen /></div>
              Identification & Meta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <InputField label="Asset Nomenclature" required value={name} onChange={setName} placeholder="Professional Product Title" />
               <SelectField label="Classification" value={category} onChange={setCategory} options={categories.map(c => ({ value: c.name, label: c.name.toUpperCase() }))} />
            </div>

            <div className="mt-8">
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 px-1">Detailed Characterization</label>
               <textarea
                 rows={5}
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Characterize the asset, its features, and utility..."
                 className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-100 transition-all font-bold text-sm text-gray-700 resize-none shadow-inner"
                 required
               />
            </div>
          </div>

          {/* Economic Parameters */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><FaRocket /></div>
              Economic & Utility Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <InputField label="Settlement Price (₦)" type="number" required value={price} onChange={setPrice} placeholder="25000" />
               <InputField label="Minimum Acquisition" type="number" required value={minOrder} onChange={setMinOrder} placeholder="1" />
               <SelectField label="Asset Condition" value={condition} onChange={setCondition} options={[{ value: "NEW", label: "BRAND NEW" }, { value: "USED", label: "PRE-OWNED" }]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
               <InputField label="Inventory Reservoir" type="number" required value={stock} onChange={setStock} placeholder="Units Available" />
               <InputField label="Affiliate Reward (%)" type="number" required value={commission} onChange={setCommission} placeholder="e.g. 5" />
               <SelectField label="Territorial Reach" value={state} onChange={setState} options={states.map(s => ({ value: s, label: s.toUpperCase() }))} placeholder="NATIONWIDE ACCESS" />
            </div>
          </div>

          {/* Fulfillment Hub */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><FaMapMarkerAlt /></div>
              Fulfillment & Dispatch Hub
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <SelectField label="Dispatch State" value={pickupState} onChange={setPickupState} options={states.map(s => ({ value: s, label: s.toUpperCase() }))} placeholder="ORIGIN STATE" />
               <SelectField label="Local Government Area" value={pickupLga} onChange={setPickupLga} options={pickupLgas.map(l => ({ value: l, label: l.toUpperCase() }))} placeholder={pickupState ? "SELECT SECTOR" : "WAITING FOR STATE"} />
            </div>
            
            <InputField label="Hub Specific Address" required value={pickupAddress} onChange={setPickupAddress} placeholder="Precise street, hub, or warehouse identifier" />
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-4">
            <button
               type="submit"
               disabled={loading}
               className="group flex items-center gap-4 px-12 py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synchronizing Asset...
                </>
              ) : (
                <>
                  Catalog To Marketplace <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};

const InputField = ({ label, required, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-blue-100 transition-all font-bold text-sm text-gray-700 shadow-inner"
      required={required}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-blue-100 transition-all font-bold text-sm text-gray-700 shadow-inner appearance-none cursor-pointer"
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
        <FaArrowRight className="rotate-90 text-[10px]" />
      </div>
    </div>
  </div>
);

export default AddProduct;