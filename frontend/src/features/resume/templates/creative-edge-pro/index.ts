import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { creativeEdgeProMeta } from './meta';
import { CreativeEdgeProPreview } from './preview';
import { CreativeEdgeProScreen } from './screen';
import { CreativeEdgeProPrint } from './print';

export const creativeEdgeProTemplate: ResumeTemplate = {
  metadata: creativeEdgeProMeta,
  Preview: CreativeEdgeProPreview,
  Screen: CreativeEdgeProScreen,
  Print: CreativeEdgeProPrint
};
