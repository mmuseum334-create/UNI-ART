import { Badge } from './Badge';
import { Heart, Eye, User, Palette } from 'lucide-react';

export const ArtworkHoverDialog = ({ artwork, category, isVisible }) => {
  if (!isVisible || !artwork) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

      {/* Dialog */}
      <div className="relative bg-white dark:bg-dark-primary rounded-xl shadow-2xl border border-slate-200 dark:border-dark-tertiary overflow-hidden max-w-2xl w-full mx-4 animate-fade-in-up">
        <div className="flex">
          {/* Image - Left Side */}
          <div className="w-64 flex-shrink-0">
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img
                src={artwork.imageUrl || artwork.thumbnailUrl}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content - Right Side */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {artwork.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
                  <User className="h-4 w-4" />
                  <span>por {artwork.artist}</span>
                </div>
              </div>
              {category && (
                <Badge variant="secondary" className="flex-shrink-0">
                  {category.name}
                </Badge>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span>{artwork.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>{artwork.views}</span>
              </div>
              {category && (
                <div className="flex items-center gap-1">
                  <Palette className="h-4 w-4 text-purple-500" />
                  <span>{category.name}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {artwork.tags.slice(0, 6).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {artwork.tags.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{artwork.tags.length - 6}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};