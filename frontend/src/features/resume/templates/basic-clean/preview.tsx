import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const BasicCleanPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg border border-gray-300 overflow-hidden bg-white p-2.5 text-[6px]">
    {/* Simple centered header */}
    <div className="text-center mb-2 pb-1.5 border-b border-gray-300">
      <div className="font-bold text-[7px] text-gray-900">{data.identity.fullName}</div>
      <div className="text-[5px] text-gray-700">{data.identity.jobTitle}</div>
      <div className="text-[4px] text-gray-600 mt-0.5">{data.identity.email}</div>
    </div>
    {/* Single column sections */}
    <div className="space-y-1.5">
      <div>
        <div className="text-[4px] font-bold uppercase text-gray-900 border-b border-gray-300 mb-0.5">SUMMARY</div>
        <div className="text-[5px] text-gray-700 leading-tight line-clamp-2">{data.summary}</div>
      </div>
      <div>
        <div className="text-[4px] font-bold uppercase text-gray-900 border-b border-gray-300 mb-0.5">EXPERIENCE</div>
        <div className="text-[5px] font-bold">{data.experience[0]?.position}</div>
        <div className="text-[4px] text-gray-600">{data.experience[0]?.company}</div>
      </div>
      <div>
        <div className="text-[4px] font-bold uppercase text-gray-900 border-b border-gray-300 mb-0.5">SKILLS</div>
        <div className="text-[4px] text-gray-700">{data.skills[0]?.items.slice(0, 4).join(', ')}</div>
      </div>
    </div>
  </div>
);
