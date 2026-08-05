export interface NavLink {
  href: string
  label: string
}

const NAV_LINKS: NavLink[] = [
  { href: '#home', label: 'Home' },
  { href: '#expertise', label: 'Expertise' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' }
]

export function useNavLinks() {
  return NAV_LINKS
}
