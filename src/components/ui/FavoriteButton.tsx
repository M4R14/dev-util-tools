import React from 'react';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from './Button';
import FavoriteIcon from './FavoriteIcon';

interface FavoriteButtonProps
  extends Omit<ButtonProps, 'onClick' | 'children' | 'aria-label' | 'title' | 'aria-pressed'> {
  isFavorite: boolean;
  onToggle: () => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorite, onToggle, className, ...props }) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={cn(
        'rounded-full',
        isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-muted-foreground/30 hover:text-muted-foreground',
        className,
      )}
      title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      aria-pressed={isFavorite}
      {...props}
    >
      <FavoriteIcon isFavorite={isFavorite} />
    </Button>
  );
};

export default FavoriteButton;
