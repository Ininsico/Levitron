import { SLIDE_ICONS } from './slideIcons.js'

export default function SlideIcon({ name, className = 'h-5 w-5', strokeWidth = 1.6, style }) {
  const Component = SLIDE_ICONS[name]

  if (!Component) return null

  return <Component className={className} strokeWidth={strokeWidth} style={style} aria-hidden="true" />
}
