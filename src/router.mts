import express from 'express';

import { overview as leadsOverview } from './handlers/leads/overview.mjs';
import { country } from './handlers/sales/country.mjs';
import { newVsReturning } from './handlers/sales/newVsReturning.mjs';
import { overview as salesOverview } from './handlers/sales/overview.mjs';
import { paymentPlan } from './handlers/sales/paymentPlan.mjs';

export const router = express.Router();

router.get('/leads/overview', leadsOverview);
router.get('/sales/overview', salesOverview);
router.get('/sales/newVsReturning', newVsReturning);
router.get('/sales/country', country);
router.get('/sales/paymentPlans', paymentPlan);
