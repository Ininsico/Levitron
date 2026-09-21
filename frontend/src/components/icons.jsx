import {
  ArrowRight,
  ChartColumn,
  Check,
  CircleAlert,
  Download,
  Lock,
  Menu,
  Minus,
  Palette,
  Plus,
  Server,
  Sparkles,
  Star,
  Terminal,
  X,
} from 'lucide-react'

const iconProps = {
  className: 'h-full w-full',
  strokeWidth: 1.6,
  'aria-hidden': 'true',
}

export const icons = {
  spark: <Sparkles {...iconProps} />,
  palette: <Palette {...iconProps} />,
  download: <Download {...iconProps} />,
  chart: <ChartColumn {...iconProps} />,
  server: <Server {...iconProps} />,
  terminal: <Terminal {...iconProps} />,
  arrow: <ArrowRight {...iconProps} />,
  check: <Check {...iconProps} />,
  plus: <Plus {...iconProps} />,
  minus: <Minus {...iconProps} />,
  menu: <Menu {...iconProps} />,
  close: <X {...iconProps} />,
  lock: <Lock {...iconProps} />,
  star: <Star {...iconProps} />,
  alert: <CircleAlert {...iconProps} />,
}
