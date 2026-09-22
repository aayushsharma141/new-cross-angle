/**
 * config/services/index.ts — Public barrel for the services config context.
 *
 * Assembles all domain arrays into the unified `services` export so that
 * the `site-content.ts` shim and any direct imports from this module work
 * identically to the original monolith.
 */

export type { ServiceCategory, ServiceDetail } from "./types";
export { serviceCategories } from "./categories";
export { residentialServices } from "./residential";
export { commercialServices } from "./commercial";
export { specializedServices } from "./specialized";

import { residentialServices } from "./residential";
import { commercialServices } from "./commercial";
import { specializedServices } from "./specialized";

/** Unified services array — maintains the same order as the original site-content.ts */
export const services = [
    ...residentialServices,
    ...commercialServices,
    ...specializedServices,
];
