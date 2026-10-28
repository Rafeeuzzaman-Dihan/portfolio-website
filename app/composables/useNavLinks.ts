export interface NavLink {
  href: string
  label: string
  icon: string
}

const NAV_LINKS: NavLink[] = [
  { href: '#home', label: 'Home', icon: 'lucide:house' },
  { href: '#expertise', label: 'Expertise', icon: 'lucide:layers' },
  { href: '#experience', label: 'Experience', icon: 'lucide:briefcase' },
  { href: '#projects', label: 'Projects', icon: 'lucide:folder' },
  { href: '#services', label: 'Services', icon: 'lucide:handshake' },
  { href: '#contact', label: 'Contact', icon: 'lucide:mail' }
]

export function useNavLinks() {
  return NAV_LINKS
}
