const ProgressBar = ({ target, raised }) => {
  const percentage = Math.min(Math.round((raised / target) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1.5 font-medium">
        <span className="text-primary-700">₹{raised.toLocaleString()} raised</span>
        <span className="text-slate-500">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-primary-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-slate-500 mt-1.5 text-right">
        of ₹{target.toLocaleString()} goal
      </div>
    </div>
  );
};

export default ProgressBar;
