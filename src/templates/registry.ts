import type {
  TemplateModule,
} from './types';

import {
  love01Template,
} from './love-01';

export const DEFAULT_TEMPLATE_ID =
  'love-01';

const modules:
TemplateModule<any>[] = [
  love01Template,
];

const moduleMap =
  new Map(
    modules.map(
      (template) => [
        template.id,
        template,
      ]
    )
  );

export const getTemplateModule = (
  templateId: string
) => {
  return (
    moduleMap.get(
      templateId
    ) || null
  );
};

export const getAllTemplateModules =
  () => {
    return [...modules];
  };
