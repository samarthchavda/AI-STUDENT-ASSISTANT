import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const SoftwareDeveloperProPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg overflow-hidden bg-white flex text-[6px]">
    {/* Dark left sidebar */}
    <div className="w-[35%] bg-gray-900 p-2 text-white">
      <div className="text-emerald-400 font-bold text-[7px] mb-1">{data.identity.fullName}</div>
      <div className="text-gray-400 text-[5px] uppercase mb-2">{data.identity.jobTitle}</div>
      <div className="space-y-1.5">
        <div>
          <div className="text-emerald-400 text-[4px] font-bold mb-0.5 uppercase">Contact</div>
          <div className="text-gray-300 text-[4px]">{data.identity.email}</div>
        </div>
        <div>
          <div className="text-emerald-400 text-[4px] font-bold mb-0.5 uppercase">Skills</div>
          <div className="flex flex-wrap gap-0.5">
            {data.skills[0]?.items.slice(0, 4).map((s, i) => (
              <span key={i} className="text-[4px] px-1 py-0.5 bg-gray-800 rounded text-gray-300">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* White right content */}
    <div className="flex-1 p-2">
      <div className="mb-1.5">
        <div className="text-[5px] font-bold text-emerald-600 mb-0.5 uppercase">About</div>
        <div className="text-[5px] text-gray-700 leading-tight line-clamp-2">{data.summary}</div>
      </div>
      <div>
        <div className="text-[5px] font-bold text-emerald-600 mb-0.5 uppercase">Experience</div>
        <div className="text-[5px] font-bold">{data.experience[0]?.position}</div>
        <div className="text-[4px] text-gray-600">{data.experience[0]?.company}</div>
      </div>
    </div>
  </div>
);
