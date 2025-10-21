import React from 'react';
import { Check } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
};

type CategoryListProps = {
  categories: Category[];
  onToggle: (id: string) => void;
};

export default function CategoryList({ categories, onToggle }: CategoryListProps) {
  return (
    <div className="cal-categories-list">
      {categories.map((category) => (
        <div
          key={category.id}
          className="cal-category"
          onClick={() => onToggle(category.id)}
        >
          <div className="cal-category-info">
            <div className={`cal-category-color cal-event--${category.id}`} />
            <span className="cal-category-name">{category.name}</span>
          </div>
          <div
            className={`cal-category-toggle ${
              category.enabled ? 'cal-category-toggle--active' : ''
            }`}
          >
            {category.enabled && <Check size={12} />}
          </div>
        </div>
      ))}
    </div>
  );
}