import express from 'express';

import { overview as leadsOverview } from './routes/leads/overview';
import { country } from './routes/sales/country';
import { newVsReturning } from './routes/sales/newVsReturning';
import { overview } from './routes/sales/overview';
import { paymentPlan } from './routes/sales/paymentPlan';

export const router = express.Router();

router.get('/leads/overview', leadsOverview);

router.get('/sales/overview', overview);
router.get('/sales/newVsReturning', newVsReturning);
router.get('/sales/country', country);
router.get('/sales/paymentPlans', paymentPlan);
