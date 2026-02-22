export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  ...props
}) {
  const baseClass = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
}

Skeleton.Text = function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
};

Skeleton.Card = function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      </div>
      <Skeleton.Text lines={3} />
    </div>
  );
};

Skeleton.QRCode = function SkeletonQRCode({ size = 200, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <Skeleton width={size} height={size} className="rounded-lg" />
      <Skeleton variant="text" className="w-32" />
    </div>
  );
};
