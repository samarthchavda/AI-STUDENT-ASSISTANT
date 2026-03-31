import { ResumeTemplate } from '../../data/resumeTemplateTypes';
import { basicCleanMeta } from './meta';
import { BasicCleanPreview } from './preview';
import { BasicCleanScreen } from './screen';
import { BasicCleanPrint } from './print';

export const basicCleanTemplate: ResumeTemplate = {
  metadata: basicCleanMeta,
  Preview: BasicCleanPreview,
  Screen: BasicCleanScreen,
  Print: BasicCleanPrint
};
