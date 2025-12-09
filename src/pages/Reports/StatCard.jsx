import React from "react";

const StatCard = ({ title, amount, change, isPositive, sentence }) => {
  return (
    <div
      className="
        bg-white rounded-lg
        shadow-sm hover:shadow-lg 
        transition-all duration-200 
        hover:-translate-y-1 
      "
      style={{padding:'8px', marginBottom:'16px'}}
    >
      {/* Header */}
      <div className="text-[12px] font-medium text-gray-700" style={{marginBottom:"12px"}}>
        {title}
      </div>

      {/* Number */}
      <div
        className="
          text-[25px] font-bold text-gray-900
          leading-none 
          font-sans 
          max-lg:text-[22px] 
          max-md:text-[20px]
        "
        style={{marginBottom:'8px'}}
      >
        {amount}
      </div>

      {/* Change or Sentence */}
      <div
        className={`
          text-[14px] 
          ${isPositive === undefined ? "text-black" : isPositive ? "text-green-500" : "text-red-500"} 
          max-lg:text-[13px] 
          max-md:text-[12px]
        `}
      >
        {isPositive !== undefined ? (
          <>
            {isPositive ? "+" : "-"}
            {change}%
            {sentence && (
              <span className="text-black ml-1 text-[14px] max-lg:text-[13px] max-md:text-[12px]">
                {sentence}
              </span>
            )}
          </>
        ) : (
          sentence && (
            <span className="text-black ml-1 text-[14px] max-lg:text-[13px] max-md:text-[12px]">
              {sentence}
            </span>
          )
        )}
      </div>
    </div>
  );
};

export default StatCard;
