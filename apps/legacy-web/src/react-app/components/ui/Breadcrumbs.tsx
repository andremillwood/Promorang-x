import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export default function Breadcrumbs({ items, showHome = true, className = '' }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', href: '/dashboard', icon: Home }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-pr-text-2 mx-1 flex-shrink-0" />
              )}
              {isLast ? (
                <span className="text-pr-text-1 font-medium flex items-center gap-1.5">
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href || '#'}
                  className="text-pr-text-2 hover:text-pr-text-1 transition-colors flex items-center gap-1.5"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
