export interface NavigationItem {
  label: string;
  href: string;
}

export interface NavigationProps {
  items: NavigationItem[];
}