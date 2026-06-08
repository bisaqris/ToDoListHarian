export const StackedStatusBar = ({ completed, pending, inProgress, total }) => {
  if (total === 0)
    return <div className="h-5 bg-gray-100 rounded-full w-full" />;

  const pctCompleted = (completed / total) * 100;
  const pctInProgress = (inProgress / total) * 100;
  const pctPending = (pending / total) * 100;

  return (
    <div className="h-5 w-full flex rounded-full overflow-hidden">
      {pctCompleted > 0 && (
        <div
          className="bg-green-400 flex items-center justify-center transition-all duration-700"
          style={{ width: `${pctCompleted}%` }}
          title={`Selesai: ${completed}`}
        >
          {pctCompleted > 10 && (
            <span className="text-[9px] text-white font-bold">
              {Math.round(pctCompleted)}%
            </span>
          )}
        </div>
      )}
      {pctInProgress > 0 && (
        <div
          className="bg-blue-400 flex items-center justify-center transition-all duration-700"
          style={{ width: `${pctInProgress}%` }}
          title={`Dikerjakan: ${inProgress}`}
        >
          {pctInProgress > 10 && (
            <span className="text-[9px] text-white font-bold">
              {Math.round(pctInProgress)}%
            </span>
          )}
        </div>
      )}
      {pctPending > 0 && (
        <div
          className="bg-orange-400 flex items-center justify-center transition-all duration-700"
          style={{ width: `${pctPending}%` }}
          title={`Pending: ${pending}`}
        >
          {pctPending > 10 && (
            <span className="text-[9px] text-white font-bold">
              {Math.round(pctPending)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};