import express from 'express';
import { country } from './routes/country';

import { newVsReturning } from './routes/newVsReturning';
import { overview } from './routes/overview';
import { paymentPlan } from './routes/paymentPlan';

export const router = express.Router();

router.get('/overview', overview);
router.get('/newVsReturning', newVsReturning);
router.get('/country', country);
router.get('/paymentPlans', paymentPlan);
