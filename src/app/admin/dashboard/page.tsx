'use client';

import { useSession } from 'next-auth/react';
import { 
  FaCalendarAlt, FaVideo, FaUsers, FaCog, FaHome, 
  FaChartLine, FaRegClock, FaMicrophone, FaEdit
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

type DashboardStats = {
  events: number;
  sermons: number;
  members: number;
  recentActivities: Array<{
    type: 'event' | 'sermon' | 'member';
    title?: string;
    date?: string;
    time?: string;
    speaker?: string;
    name?: string;
    role?: string;
    timestamp: number;
    createdAt: string;
  }>;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'event':
      return <FaCalendarAlt className="w-4 h-4 text-primary" />;
    case 'sermon':
      return <FaMicrophone className="w-4 h-4 text-primary" />;
    case 'member':
      return <FaUsers className="w-4 h-4 text-primary" />;
    default:
      return <FaEdit className="w-4 h-4 text-primary" />;
  }
};

const getActivityText = (activity: DashboardStats['recentActivities'][0]) => {
  switch (activity.type) {
    case 'event':
      return `Nouvel événement: ${activity.title}`;
    case 'sermon':
      return `Nouvelle prédication par ${activity.speaker}: ${activity.title}`;
    case 'member':
      return `Nouveau membre d'équipe: ${activity.name} (${activity.role})`;
    default:
      return 'Nouvelle activité';
  }
};

const getActivityDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const timeAgo = formatDistanceToNow(date, { locale: fr, addSuffix: true });
  const fullDate = format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
  
  // If the date is in the future or invalid, use current date
  if (date > now || isNaN(date.getTime())) {
    const currentDate = new Date();
    return {
      timeAgo: formatDistanceToNow(currentDate, { locale: fr, addSuffix: true }),
      fullDate: format(currentDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })
    };
  }
  
  return { timeAgo, fullDate };
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({ 
    events: 0, 
    sermons: 0, 
    members: 0,
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchStats();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchStats);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchStats);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
              <p className="text-gray-500 mt-1">
                Bienvenue, {session?.user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FaUsers className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-12 gap-6"
        >
          {/* Quick Stats */}
          <motion.div 
            variants={item}
            className="col-span-12 lg:col-span-8 space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaChartLine className="text-primary" />
                    Statistiques
                  </h3>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {isLoading ? 'Chargement...' : 'Temps réel'}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="group hover:scale-105 transition-all duration-200">
                    <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:shadow-md transition-all">
                        <FaCalendarAlt className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-bold text-gray-900">{stats.events}</p>
                        <p className="text-sm font-medium text-gray-600">Événements</p>
                      </div>
                    </div>
                  </div>
                  <div className="group hover:scale-105 transition-all duration-200">
                    <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:shadow-md transition-all">
                        <FaVideo className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-bold text-gray-900">{stats.sermons}</p>
                        <p className="text-sm font-medium text-gray-600">Prédications</p>
                      </div>
                    </div>
                  </div>
                  <div className="group hover:scale-105 transition-all duration-200">
                    <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4 group-hover:shadow-md transition-all">
                        <FaUsers className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-bold text-gray-900">{stats.members}</p>
                        <p className="text-sm font-medium text-gray-600">Membres</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FaCog className="text-primary" />
                  Actions rapides
                </h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/admin/homepage"
                    className="group flex items-center gap-4 p-6 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                      <FaHome className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block text-lg">Gérer la page d'accueil</span>
                      <span className="text-sm text-gray-500">Modifier le contenu principal</span>
                    </div>
                  </Link>
                  <Link
                    href="/admin/events?tab=create"
                    className="group flex items-center gap-4 p-6 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                      <FaCalendarAlt className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block text-lg">Ajouter un événement</span>
                      <span className="text-sm text-gray-500">Créer un nouvel événement</span>
                    </div>
                  </Link>
                  <Link
                    href="/admin/predications/new"
                    className="group flex items-center gap-4 p-6 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 hover:shadow-md transition-all duration-200 sm:col-span-2"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                      <FaMicrophone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block text-lg">Nouvelle prédication</span>
                      <span className="text-sm text-gray-500">Ajouter une prédication</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            variants={item}
            className="col-span-12 lg:col-span-4 space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaRegClock className="text-primary" />
                    Activités récentes
                  </h3>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {isLoading ? 'Chargement...' : 'Temps réel'}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity, index) => {
                    const { timeAgo, fullDate } = getActivityDate(activity.timestamp);
                    return (
                      <div 
                        key={index}
                        className="p-6 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {getActivityText(activity)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <time 
                                className="text-xs text-gray-500"
                                title={fullDate}
                              >
                                {timeAgo}
                              </time>
                              {activity.date && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(), "d MMM yyyy", { locale: fr })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Aucune activité récente
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 