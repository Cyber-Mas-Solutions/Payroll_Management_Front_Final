import React, { useState } from 'react';

const DaySelector = ({ type = 'monthYear', onChange, initialYear  }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState( initialYear || now.getFullYear());

  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 10 + i);

  const handleChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);

    if (onChange) {
      if (type === 'year') onChange({ year: newYear });
      else if (type === 'month') onChange({ month: newMonth });
      else onChange({ month: newMonth, year: newYear });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        flexWrap: 'wrap',
      }}
    >
      {(type === 'month' || type === 'monthYear') && (
        <div>
          <label>Month:</label>
          <select
            style={{height:'34px',  margin:'2px'}}
            value={month}
            onChange={(e) => handleChange(Number(e.target.value), year)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1} >
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      )}

      {(type === 'year' || type === 'monthYear') && (
        <div>
          <label>Year:</label>
          <select
            style={{height:24, margin:5}}
            value={year}
            onChange={(e) => handleChange(month, Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DaySelector;
