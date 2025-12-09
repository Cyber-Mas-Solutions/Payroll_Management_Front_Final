import React from 'react';

const TotalCard = ({ name, amount }) => {
  return (
    <div
      className="
        bg-gray-100 
        px-6 py-4 
        rounded-full 
        shadow-md 
        text-center 
        min-w-[120px] 
        font-bold 
        text-gray-800
      "
    >
      {name} <br /> {amount}
    </div>
  );
};

export default TotalCard;
