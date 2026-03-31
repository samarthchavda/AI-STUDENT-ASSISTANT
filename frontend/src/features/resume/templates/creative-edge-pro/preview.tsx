import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const CreativeEdgeProPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg overflow-hidden bg-white flex text-[6px]">
    <div className="w-2/5 bg-gradient-to-br from-pink-500 to-pink-600 p-2 text-white">
      <div className="w-4 h-[2px] bg-white mb-1" />
      <div className="font-black text-[8px] mb-1 leading-tight">{data.identity.fullName}</div>
      <div className="text-[5px] opacity-90 mb-2">{data.identity.jobTitle}</div>
      <div className="space-y-1.5">
        <div>
          <div className="text-[4px] font-bold mb-0.5 opacity-80 uppercase">Contact</div>
          <div className="text-[4px] opacity-90">{data.identity.email}</div>
        </div>
        <div>
          <div className="text-[4px] font-bold mb-0.5 opacity-80 uppercase">Skills</div>
          <div className="text-[4px] opacity-90">{data.skills[0]?.items.slice(0, 3).join(', ')}</div>
        </div>
      </div>
    </div>
    <div className="flex-1 p-2">
      <div className="mb-1.5">
        <div className="text-[6px] font-bold text-pink-600 mb-0.5">About</div>
        <div className="text-[5px] text-gray-700 leading-tight line-clamp-2">{data.summary}</div>
      </div>
      <div>
        <div className="text-[6px] font-bold text-pink-600 mb-0.5">Experience</div>
        <div className="text-[5px] font-bold">{data.experience[0]?.position}</div>
        <div className="text-[4px] text-gray-500">{data.experience[0]?.company}</div>
      </div>
    </div>
  </div>
);
