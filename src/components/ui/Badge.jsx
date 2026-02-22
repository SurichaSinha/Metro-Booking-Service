const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-metro-blue/10 text-metro-blue',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  interchange: 'bg-purple-100 text-purple-800 ring-1 ring-purple-300',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  color,
  className = '',
  ...props
}) {
  const customStyle = color ? {
    backgroundColor: `${color}20`,
    color: color,
  } : {};

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${!color ? variants[variant] : ''}
        ${sizes[size]}
        ${className}
      `}
      style={customStyle}
      {...props}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}
