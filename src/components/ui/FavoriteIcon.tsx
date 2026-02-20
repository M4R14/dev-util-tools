import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FavoriteIconProps extends React.ComponentProps<typeof Star> {
  isFavorite?: boolean;
}

const FavoriteIcon: React.FC<FavoriteIconProps> = ({ isFavorite = false, className, ...props }) => {
  return <Star className={cn('h-4 w-4', isFavorite && 'fill-current', className)} aria-hidden="true" {...props} />;
};

export default FavoriteIcon;
