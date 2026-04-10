'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from './Card';
import { UserColorIconCircle } from './UserColorElements';
import { Box, Users, Palette } from 'lucide-react';
import { paintService } from '@/services/paint/paintService';
import { sculptureService } from '@/services/sculpture/sculptureService';

const HomeStats = () => {
  const [paintCount, setPaintCount] = useState(null);
  const [sculptureCount, setSculptureCount] = useState(null);

  useEffect(() => {
    paintService.getAll().then(res => {
      if (res.success) setPaintCount(res.data.length);
    });
    sculptureService.getAll().then(res => {
      if (res.success) setSculptureCount(res.data.length);
    });
  }, []);

  const stats = [
    { label: 'Obras de Arte',      value: paintCount    ?? '...', icon: Palette },
    { label: 'Artistas',           value: '312',                  icon: Users   },
    { label: 'Obras de Escultura', value: sculptureCount ?? '...', icon: Box    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
            Estadísticas del Museo
          </h2>
          <p className="text-slate-600 dark:text-slate-300">Números que reflejan nuestra comunidad artística</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center card-hover">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <UserColorIconCircle>
                      <IconComponent className="h-8 w-8 text-white" />
                    </UserColorIconCircle>
                  </div>
                  <div className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeStats;
