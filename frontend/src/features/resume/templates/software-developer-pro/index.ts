import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { softwareDeveloperProMeta } from './meta';
import { SoftwareDeveloperProPreview } from './preview';
import { SoftwareDeveloperProScreen } from './screen';
import { SoftwareDeveloperProPrint } from './print';

export const softwareDeveloperProTemplate: ResumeTemplate = {
  metadata: softwareDeveloperProMeta,
  Preview: SoftwareDeveloperProPreview,
  Screen: SoftwareDeveloperProScreen,
  Print: SoftwareDeveloperProPrint
};
