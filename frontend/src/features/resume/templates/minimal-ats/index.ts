import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { minimalAtsMeta } from './meta';
import { MinimalAtsPreview } from './preview';
import { MinimalAtsScreen } from './screen';
import { MinimalAtsPrint } from './print';

export const minimalAtsTemplate: ResumeTemplate = {
  metadata: minimalAtsMeta,
  Preview: MinimalAtsPreview,
  Screen: MinimalAtsScreen,
  Print: MinimalAtsPrint
};
