import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { modernProfessionalMeta } from './meta';
import { ModernProfessionalPreview } from './preview';
import { ModernProfessionalScreen } from './screen';
import { ModernProfessionalPrint } from './print';

export const modernProfessionalTemplate: ResumeTemplate = {
  metadata: modernProfessionalMeta,
  Preview: ModernProfessionalPreview,
  Screen: ModernProfessionalScreen,
  Print: ModernProfessionalPrint
};
