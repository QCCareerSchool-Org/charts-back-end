import * as yup from 'yup';

export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type School = 'QC Makeup Academy' | 'QC Event School' | 'QC Design School' | 'QC Pet Studies' | 'QC Wellness Studies' | 'Winghill Writing School';

export type RequestBody = {
  period: Period;
  school?: School;
};

export const overviewSchema = yup.object<RequestBody>({
  period: yup.string().oneOf([ 'daily', 'weekly', 'monthly', 'quarterly' ]).required(),
  school: yup.mixed().oneOf([
    'QC Makeup Academy',
    'QC Event School',
    'QC Design School',
    'QC Pet Studies',
    'QC Wellness Studies',
    'Winghill Writing School',
  ]),
}).required();
