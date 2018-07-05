import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services';

import { ROOT, USER, NOT_FOUND, CONTACT_INFO, EXISTING_AGENCY_INFO } from './shared/constants';

export const routes: Routes = [
  { path: ROOT.NAME, redirectTo: EXISTING_AGENCY_INFO.URL, pathMatch: 'full' },
  {
    path: USER.NAME,
    loadChildren: './qualivis/qualivis.module#QualivisModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    canActivate: [AuthGuard]
  },
  { path: NOT_FOUND.NAME, redirectTo: EXISTING_AGENCY_INFO.URL },
];
