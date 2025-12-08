import React from 'react';
import DeductionsChart from './DeductionsChart';
import AllowancesChart from './AllowanceChart';
import BonusesChart from './BonusesChart';


const CostCenterAnalysisCharts = ({ year = new Date().getFullYear() }) => {
  return (
    <div
      style={{
        display: 'grid',
        gap: '10px',
        gridTemplateColumns: '1fr',
      }}
    >
      <DeductionsChart year={year} />
      <AllowancesChart year={year} />
      <BonusesChart year={year} />
    </div>

  );
};

export default CostCenterAnalysisCharts;
