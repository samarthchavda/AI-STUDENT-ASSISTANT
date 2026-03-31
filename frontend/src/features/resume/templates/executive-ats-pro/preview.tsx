import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const ExecutiveAtsProPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg border border-gray-300 overflow-hidden bg-white text-[6px]">
    {/* Executive header bar */}
    <div className="bg-slate-800 p-1.5 text-white">
      <div className="font-bold text-[8px] font-serif">{data.identity.fullName}</div>
      <div className="text-[5px] opacity-90">{data.identity.jobTitle}</div>
    </div>
    <div className="p-2 space-y-1.5">
      <div className="text-[4px] text-gray-600 border-b border-gray-300 pb-1">
        {data.identity.email} • {data.identity.phone}
      </div>
      <div>
        <div className="text-[4px] font-bold uppercase text-slate-800 border-b border-gray-400 mb-0.5 font-serif">EXECUTIVE SUMMARY</div>
        <div className="text-[5px] text-gray-700 leading-tight line-clamp-2">{data.summary}</div>
      </div>
      <div>
        <div className="text-[4px] font-bold uppercase text-slate-800 border-b border-gray-400 mb-0.5 font-serif">EXPERIENCE</div>
        <div className="text-[5px] font-bold font-serif">{data.experience[0]?.position}</div>
        <div className="text-[4px] text-gray-600">{data.experience[0]?.company}</div>
      </div>
    </div>
  </div>
);
