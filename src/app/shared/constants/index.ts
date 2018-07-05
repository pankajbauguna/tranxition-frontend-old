export * from './validation-messages.constant';
export * from './help.messages';
export * from './api-urls.constant';
export * from './regex-patterns.constant';
export * from './routes.constant';
export * from './actions.constant';

import { Constant } from '../index';
export const TermsContent: Constant = {
  AGREEMENT_CONTENT: `Beginning female had moving is sea itself there were every without of they're be\
    fourth days given rule rule. Open unto god under herb dry whose may place.\
    Set waters form kind. Moving fruitful male. Moved brought moving air him set.\
    Life fruit years don't together good that bring there appear us bearing i third.\
    Creepeth make may one void face. And don't, for. Face. Earth made creepeth forth.\
    It creepeth replenish, saw third. Subdue of. Creeping every seasons she'd air moving Midst she'd fish created, void.\
    Winged itself divide female Night dominion air and brought gathered. I them bearing.`,
  GUARANTEE_CONTENT: `Beginning female had moving is sea itself there were every without of they're be fourth     days given rule rule.\
    Open unto god under herb dry whose may place. Set waters form kind. Moving fruitful male. Moved brought moving air him set.\
    Life fruit years don't together good that bring there appear us bearing i third. Creepeth make may one void face.\
    And don't, for. Face. Earth made creepeth forth. It creepeth replenish, saw third. Subdue of.\
    Creeping every seasons she'd air moving Midst she'd fish created, void.\
    Winged itself divide female Night dominion air and brought gathered. I them bearing.`
};

export const APP_LOGO = '../../assets/images/logo_color.png';
export const INFO_ICON = '../../assets/images/more_info_icon.png';

export const DefaultExpiryYear = {
  JCAHO: 2,
  INSURER: 1
};

export const DEFAULT_HTTP_TIMEOUT = 15000;

export const ACCEPTED_FILE_FORMATS = [
 '.xls',
 '.xlsx',
 '.pdf',
 '.csv',
 '.ppt',
 '.pptx',
 '.pps',
 '.ppsx',
 '.txt',
 '.doc',
 '.docx'
];

export const FILE_SIZE_LIMIT = 100000000;

export const PIE_CHART_COLOR_CODES = {
  pending: '#004B87',
  approved: '#FEEBCE',
  rejected: '#F4C4D6',
  returned: '#CFEDF9'
};
export const CONTACT_US_MAIL = 'rfp@qualivis.com';

export const APPLICATION_RESET_ACTION = {
  level0: { label: 'Re-sign', value: 0 },
  level1: { label: 'Cancel', value: 1 },
  level2: { label: 'Delete', value: 2 }
};
