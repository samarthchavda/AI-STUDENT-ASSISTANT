import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { darkTechSidebarProMeta } from './meta';
import { DarkTechSidebarProPreview } from './preview';
import { DarkTechSidebarProScreen } from './screen';
import { DarkTechSidebarProPrint } from './print';

export const darkTechSidebarProTemplate: ResumeTemplate = {
  metadata: darkTechSidebarProMeta,
  Preview: DarkTechSidebarProPreview,
  Screen: DarkTechSidebarProScreen,
  Print: DarkTechSidebarProPrint
};
