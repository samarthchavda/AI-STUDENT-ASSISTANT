import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { fresherPlacementProMeta } from './meta';
import { FresherPlacementProPreview } from './preview';
import { FresherPlacementProScreen } from './screen';
import { FresherPlacementProPrint } from './print';

export const fresherPlacementProTemplate: ResumeTemplate = {
  metadata: fresherPlacementProMeta,
  Preview: FresherPlacementProPreview,
  Screen: FresherPlacementProScreen,
  Print: FresherPlacementProPrint
};
