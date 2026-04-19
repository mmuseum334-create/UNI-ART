'use client';

import { CategoryShowcase } from '../components/ui/CategoryShowcase';
import ArtCollageSection from '../components/ui/TrendingArtists';
import FeaturedArtworks from '../components/ui/FeaturedArtworks';
import HomeHero from '../components/ui/HomeHero';
import HomeStats from '../components/ui/HomeStats';
import HomeSculptures from '../components/ui/HomeSculptures';
import { artCategories } from '../data/mockData';
import {
  BookOpen, Music, Video, Palette, Image, Box, Sparkles, FileText, Camera
} from 'lucide-react';

const iconMap = { BookOpen, Music, Video, Palette, Image, Box, Sparkles, FileText, Camera };

const Home = () => {
  return (
    <div className="min-h-screen">
      <HomeHero />
      <HomeStats />
      <FeaturedArtworks />
      <CategoryShowcase categories={artCategories} iconMap={iconMap} />
      <ArtCollageSection />
      <HomeSculptures />
    </div>
  );
};

export default Home;
