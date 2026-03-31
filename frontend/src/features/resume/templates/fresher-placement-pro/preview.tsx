import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const FresherPlacementProPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg overflow-hidden bg-white text-[6px]">
    <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2 text-white text-center">
      <div className="font-bold text-[8px]">{data.identity.fullName}</div>
      <div className="text-[5px] opacity-90">{data.identity.jobTitle}</div>
      <div className="text-[4px] opacity-80 mt-0.5">{data.identity.email} • {data.identity.phone}</div>
    </div>
    <div className="p-2 space-y-1.5">
      <div>
        <div className="text-[5px] font-bold text-purple-600 mb-0.5">OBJECTIVE</div>
        <div className="text-[5px] text-gray-700 leading-tight line-clamp-2">{data.summary}</div>
      </div>
      <div>
        <div className="text-[5px] font-bold text-purple-600 mb-0.5">EDUCATION</div>
        <div className="text-[5px] font-bold">{data.education[0]?.degree}</div>
        <div className="text-[4px] text-gray-500">{data.education[0]?.school}</div>
      </div>
      <div>
        <div className="text-[5px] font-bold text-purple-600 mb-0.5">SKILLS</div>
        <div className="text-[4px] text-gray-600">{data.skills[0]?.items.slice(0, 5).join(' • ')}</div>
      </div>
    </div>
  </div>
);
