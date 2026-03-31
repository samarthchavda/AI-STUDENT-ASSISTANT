import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const MinimalAtsPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg border border-gray-200 overflow-hidden bg-white p-2 text-[6px]">
    {/* Compact header */}
    <div className="mb-1.5">
      <div className="font-normal text-[7px] text-gray-900">{data.identity.fullName}</div>
      <div className="text-[4px] text-gray-500 uppercase tracking-widest">{data.identity.jobTitle}</div>
      <div className="text-[4px] text-gray-600 mt-0.5">{data.identity.email}</div>
    </div>
    {/* Dense sections */}
    <div className="space-y-1">
      <div>
        <div className="text-[4px] font-bold uppercase text-gray-400 mb-0.5">PROFILE</div>
        <div className="text-[5px] text-gray-700 leading-tight line-clamp-2">{data.summary}</div>
      </div>
      <div>
        <div className="text-[4px] font-bold uppercase text-gray-400 mb-0.5">EXPERIENCE</div>
        <div className="text-[5px] font-bold">{data.experience[0]?.position}</div>
        <div className="text-[4px] text-gray-600">{data.experience[0]?.company}</div>
      </div>
      <div>
        <div className="text-[4px] font-bold uppercase text-gray-400 mb-0.5">SKILLS</div>
        <div className="text-[4px] text-gray-600">{data.skills[0]?.items.slice(0, 5).join(', ')}</div>
      </div>
    </div>
  </div>
);
