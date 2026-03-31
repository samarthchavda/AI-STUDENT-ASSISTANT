import React from 'react';
import { TemplateProps } from '../../data/resumeTemplateTypes';

export const DarkTechSidebarProPreview: React.FC<TemplateProps> = ({ data }) => (
  <div className="h-full rounded-lg overflow-hidden bg-white flex text-[6px]">
    <div className="w-2/5 bg-black p-2">
      <div className="text-cyan-400 font-bold text-[8px] mb-1">{data.identity.fullName}</div>
      <div className="text-gray-400 text-[5px] mb-2 uppercase tracking-wide">{data.identity.jobTitle}</div>
      <div className="space-y-1.5">
        <div>
          <div className="text-cyan-400 text-[5px] font-bold mb-0.5 uppercase">Contact</div>
          <div className="text-gray-300 text-[4px] space-y-0.5">
            <div>{data.identity.email}</div>
            <div>{data.identity.phone}</div>
          </div>
        </div>
        <div>
          <div className="text-cyan-400 text-[5px] font-bold mb-0.5 uppercase">Skills</div>
          <div className="text-gray-300 text-[4px]">
            {data.skills[0]?.items.slice(0, 4).join(', ')}
          </div>
        </div>
      </div>
    </div>
    <div className="flex-1 p-2">
      <div className="mb-1.5">
        <div className="text-[5px] font-bold text-cyan-600 mb-0.5 uppercase">Experience</div>
        <div className="text-[5px] font-bold">{data.experience[0]?.position}</div>
        <div className="text-[4px] text-gray-500">{data.experience[0]?.company}</div>
      </div>
      <div>
        <div className="text-[5px] font-bold text-cyan-600 mb-0.5 uppercase">Education</div>
        <div className="text-[5px]">{data.education[0]?.degree}</div>
      </div>
    </div>
  </div>
);
