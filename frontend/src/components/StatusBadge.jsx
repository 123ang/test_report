import React from 'react';
import { useLang } from '../context/LangContext';
import { STATUS_COLORS } from '../utils/constants';

const StatusBadge = ({ status }) => {
  const { t } = useLang();
  
  return (
    <span className={`badge ${STATUS_COLORS[status] || 'badge'}`}>
      {t(`status.${status}`)}
    </span>
  );
};

export default StatusBadge;
