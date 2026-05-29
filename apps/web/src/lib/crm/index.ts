/**
 * CRM domain manifest barrel.
 *
 * Components should import from `@/lib/crm` rather than reaching into
 * individual files. This keeps the surface area discoverable and lets us
 * reorganize internals without touching every consumer.
 */

export * from "./stages";
export * from "./sources";
export * from "./types";
export * from "./temperature";
export * from "./views";
export * from "./sorts";
export * from "./nav";
export * from "./kpis";
