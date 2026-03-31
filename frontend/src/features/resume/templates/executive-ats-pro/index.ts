import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { executiveAtsProMeta } from './meta';
import { ExecutiveAtsProPreview } from './preview';
import { ExecutiveAtsProScreen } from './screen';
import { ExecutiveAtsPrint } from './print';

export const executiveAtsProTemplate: ResumeTemplate = {
  metadata: executiveAtsProMeta,
  Preview: ExecutiveAtsProPreview,
  Screen: ExecutiveAtsProScreen,
  Print: ExecutiveAtsPrint
};
