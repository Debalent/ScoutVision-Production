// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Sports Module Index
// Auto-registers all sport modules on import.
// ═══════════════════════════════════════════════════════════════════════════

export { registerSportModule, getSportModule, listSportModules } from './base';
export type { SportModule, SportModuleContext, MetricDefinition } from './base';

import { registerSportModule } from './base';
import { footballModule } from './football';
import { basketballModule } from './basketball';
import { soccerModule } from './soccer';
import { baseballModule } from './baseball';
import { trackModule } from './track';

// ── Auto-register all built-in sport modules ────────────────────────────
registerSportModule(footballModule);
registerSportModule(basketballModule);
registerSportModule(soccerModule);
registerSportModule(baseballModule);
registerSportModule(trackModule);

export { footballModule } from './football';
export { basketballModule } from './basketball';
export { soccerModule } from './soccer';
export { baseballModule } from './baseball';
export { trackModule } from './track';
