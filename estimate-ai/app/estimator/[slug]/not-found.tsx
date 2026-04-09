export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0E0A] text-[#F2EEE7]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#D4AF63' }}>
          404
        </h1>
        <p className="text-xl mb-2">Estimator Not Found</p>
        <p className="text-gray-400">
          This contractor page doesn&apos;t exist or is no longer active.
        </p>
      </div>
    </div>
  );
}
