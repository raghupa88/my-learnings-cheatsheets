import './CategoryTabs.css';

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}

export function CategoryTabs({ categories, active, onSelect }: CategoryTabsProps) {
  return (
    <div className="category-tabs" role="tablist">
      {categories.map(cat => (
        <button
          key={cat}
          role="tab"
          aria-selected={active === cat}
          className={`category-tabs__tab${active === cat ? ' category-tabs__tab--active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
