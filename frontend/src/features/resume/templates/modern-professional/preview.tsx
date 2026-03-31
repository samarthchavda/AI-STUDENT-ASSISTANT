import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const ModernProfessionalPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg overflow-hidden bg-white text-[6px]">
    {/* Blue top line */}
    <div className="h-[3px] bg-blue-500" />
    {/* Header */}
    <div className="bg-gray-50 p-1.5">
      <div className="font-bold text-[7px] text-blue-600">{data.identity.fullName}</div>
      <div className="text-[5px] text-gray-700">{data.identity.jobTitle}</div>
    </div>
    {/* Two columns */}
    <div className="flex">
      <div className="w-[65%] p-1.5 pr-1">
        <div className="mb-1">
          <div className="text-[5px] font-bold text-blue-600 mb-0.5 flex items-center gap-0.5">
            <span className="w-[2px] h-[6px] bg-blue-600 inline-block" />
            SUMMARY
          </div>
          <div className="text-[4px] text-gray-700 leading-tight line-clamp-2 pl-1">{data.summary}</div>
        </div>
        <div>
          <div className="text-[5px] font-bold text-blue-600 mb-0.5 flex items-center gap-0.5">
            <span className="w-[2px] h-[6px] bg-blue-600 inline-block" />
            EXPERIENCE
          </div>
          <div className="pl-1">
            <div className="text-[5px] font-bold">{data.experience[0]?.position}</div>
            <div className="text-[4px] text-gray-600">{data.experience[0]?.company}</div>
          </div>
        </div>
      </div>
      <div className="w-[35%] bg-gray-50 p-1.5 pl-1">
        <div className="text-[5px] font-bold text-blue-600 mb-0.5">SKILLS</div>
        <div className="text-[4px] text-gray-600 space-y-0.5">
          {data.skills.slice(0, 2).map((s, i) => (
            <div key={i}>• {s.items.slice(0, 2).join(', ')}</div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
