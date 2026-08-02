import React from 'react';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from './Button';
import { FavoriteIcon } from './FavoriteIcon';

/**
 * The label and `aria-pressed` state are owned here so every favourite toggle in the app
 * announces itself the same way. Pass `itemName` in list contexts — a page full of identical
 * "Add to Favorites" buttons is useless to a screen reader.
 */
interface FavoriteButtonProps
  extends Omit<ButtonProps, 'onClick' | 'children' | 'aria-label' | 'title' | 'aria-pressed'> {
  isFavorite: boolean;
  onToggle: () => void;
  /** Names the thing being favourited, e.g. "Add JSON Formatter to favorites". */
  itemName?: string;
  iconClassName?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  itemName,
  className,
  iconClassName,
  ...props
}) => {
  const label = itemName
    ? isFavorite
      ? `Remove ${itemName} from favorites`
      : `Add ${itemName} to favorites`
    : isFavorite
      ? 'Remove from Favorites'
      : 'Add to Favorites';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={cn(
        'rounded-full',
        isFavorite
          ? 'text-amber-400 hover:text-amber-500'
          : 'text-muted-foreground/30 hover:text-muted-foreground',
        className,
      )}
      title={label}
      aria-label={label}
      aria-pressed={isFavorite}
      {...props}
    >
      <FavoriteIcon isFavorite={isFavorite} className={iconClassName} />
    </Button>
  );
};

