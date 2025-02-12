'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FaArrowLeft, FaSave, FaPrayingHands, FaUsers, FaHandsHelping } from 'react-icons/fa';
import { FiEye, FiEdit3, FiLayout } from 'react-icons/fi';
import Link from 'next/link';

interface VisionItem {
  icon: string;
  title: string;
  description: string;
}

interface VisionSection {
  mainTitle: string;
  subtitle: string;
  description: string;
  items: VisionItem[];
}

const defaultVisionData: VisionSection = {
  mainTitle: 'Notre Vision',
  subtitle: 'Foi · Communauté · Service',
  description: 'Ancrés dans la Parole de Dieu, nous aspirons à être une communauté vibrante qui inspire, équipe et mobilise chaque personne à vivre pleinement sa foi et à avoir un impact transformateur dans notre société.',
  items: [
    {
      icon: 'FaPrayingHands',
      title: 'Foi',
      description: 'Grandir ensemble dans la connaissance de Dieu et dans notre relation avec Lui.',
    },
    {
      icon: 'FaUsers',
      title: 'Communauté',
      description: 'Créer des liens authentiques et soutenir chacun dans son parcours de vie.',
    },
    {
      icon: 'FaHandsHelping',
      title: 'Service',
      description: "S'engager à servir notre prochain et à faire une différence dans notre société.",
    },
  ],
};

export default function VisionManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visionData, setVisionData] = useState<VisionSection>(defaultVisionData);

  useEffect(() => {
    const fetchVisionData = async () => {
      try {
        const response = await fetch('/api/homepage/vision');
        if (!response.ok) throw new Error('Failed to fetch vision data');
        const data = await response.json();
        setVisionData(data);
      } catch (error) {
        console.error('Error fetching vision data:', error);
        toast.error('Failed to load vision data');
      } finally {
        setLoading(false);
      }
    };

    fetchVisionData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/homepage/vision', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visionData),
      });

      if (!response.ok) throw new Error('Failed to save vision data');
      
      toast.success('Vision section updated successfully');
    } catch (error) {
      console.error('Error saving vision data:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleItemChange = (index: number, field: keyof VisionItem, value: string) => {
    setVisionData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FaPrayingHands': return <FaPrayingHands className="w-5 h-5" />;
      case 'FaUsers': return <FaUsers className="w-5 h-5" />;
      case 'FaHandsHelping': return <FaHandsHelping className="w-5 h-5" />;
      default: return null;
    }
  };

  const inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white";
  const textareaClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white resize-none";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vision Section</h1>
                <p className="text-sm text-gray-500">Manage your church's vision and core values</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              <FaSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Form */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <FiEdit3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Main Content</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Main Title</label>
                  <input
                    type="text"
                    value={visionData.mainTitle}
                    onChange={(e) => setVisionData(prev => ({ ...prev, mainTitle: e.target.value }))}
                    className={inputClassName}
                    placeholder="Enter main title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                  <input
                    type="text"
                    value={visionData.subtitle}
                    onChange={(e) => setVisionData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className={inputClassName}
                    placeholder="Enter subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={visionData.description}
                    onChange={(e) => setVisionData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={textareaClassName}
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <FiLayout className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Vision Items</h2>
              </div>
              <div className="space-y-6">
                {visionData.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {getIconComponent(item.icon)}
                      </div>
                      <h3 className="font-medium text-gray-900">Vision Item {index + 1}</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                          className={inputClassName}
                          placeholder="Enter item title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          rows={3}
                          className={textareaClassName}
                          placeholder="Enter item description"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-1"
          >
            <div className="sticky top-28">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <FiEye className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="max-w-3xl mx-auto text-center">
                      <h3 className="text-2xl font-bold text-gray-900">{visionData.mainTitle}</h3>
                      <p className="text-primary mt-2 font-medium">{visionData.subtitle}</p>
                      <p className="text-gray-600 mt-4 text-sm">{visionData.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mt-8">
                      {visionData.items.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              {getIconComponent(item.icon)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{item.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 