"use client";

import { useEffect, useState } from "react";

interface Schedule {
  _id: string;
  title: string;
  day: string;
  time: string;
  description: string;
}

export default function HorairesSection() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/jeunes/horaires");
        if (!res.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = await res.json();
        setSchedules(data.schedules || []);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setError("Une erreur s'est produite lors du chargement des horaires.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Nos Horaires</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Nos Horaires</h2>
          <div className="text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Nos Horaires</h2>
        {schedules.length === 0 ? (
          <p className="text-center text-gray-600">Aucun horaire n'est disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{schedule.title}</h3>
                <div className="text-gray-600 mb-3">
                  <p className="font-medium">
                    {schedule.day} à {schedule.time}
                  </p>
                </div>
                <p className="text-gray-700">{schedule.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
} 