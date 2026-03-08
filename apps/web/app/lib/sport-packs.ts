// ─── ScoutVision Sport Packs ────────────────────────────────────────
// Sport-specific configurations that plug into the existing evaluation structure.
// Each pack defines measurables, analytics, skills, archetypes, and positions
// that are loaded when a sport is selected from the existing menu.

// ─── Types ──────────────────────────────────────────────────────────

export type SportKey = 'football' | 'basketball' | 'baseball' | 'soccer' | 'hockey';

export interface Measurable {
  key: string;
  label: string;
  unit: string;
  higherBetter: boolean;
}

export interface AnalyticMetric {
  key: string;
  label: string;
  unit: string;
  description: string;
}

export interface SkillCategory {
  key: string;
  label: string;
  description: string;
}

export interface Archetype {
  key: string;
  label: string;
  description: string;
  keyTraits: string[];
}

export interface PositionGroup {
  key: string;
  label: string;
  positions: string[];
  specificSkills: string[];
}

export interface SportPack {
  key: SportKey;
  label: string;
  icon: string;
  color: string;
  measurables: Measurable[];
  analytics: AnalyticMetric[];
  skills: SkillCategory[];
  archetypes: Archetype[];
  positions: PositionGroup[];
  evaluationCategories: string[];
  redFlagIndicators: string[];
  roleFitCategories: string[];
}

// ─── Football Pack ──────────────────────────────────────────────────

export const FOOTBALL_PACK: SportPack = {
  key: 'football',
  label: 'Football',
  icon: '🏈',
  color: '#8B4513',
  measurables: [
    { key: 'height', label: 'Height', unit: 'in', higherBetter: true },
    { key: 'weight', label: 'Weight', unit: 'lbs', higherBetter: true },
    { key: 'armLength', label: 'Arm Length', unit: 'in', higherBetter: true },
    { key: 'fortyYard', label: '40-Yard Dash', unit: 's', higherBetter: false },
    { key: 'shuttle', label: 'Shuttle', unit: 's', higherBetter: false },
    { key: 'threeCone', label: '3-Cone', unit: 's', higherBetter: false },
    { key: 'vertical', label: 'Vertical', unit: 'in', higherBetter: true },
    { key: 'broad', label: 'Broad Jump', unit: 'in', higherBetter: true },
  ],
  analytics: [
    { key: 'epa', label: 'EPA', unit: '', description: 'Expected Points Added per play' },
    { key: 'pressurePct', label: 'Pressure %', unit: '%', description: 'Percentage of dropbacks under pressure' },
    { key: 'separation', label: 'Separation', unit: 'yds', description: 'Average separation from coverage' },
    { key: 'yac', label: 'YAC', unit: 'yds', description: 'Yards After Contact / Catch' },
    { key: 'missedTacklesForced', label: 'Missed Tackles Forced', unit: '', description: 'Forced missed tackles per touch' },
    { key: 'completionPctOverExpected', label: 'CPOE', unit: '%', description: 'Completion % over expected' },
  ],
  skills: [
    { key: 'processing', label: 'Processing Speed', description: 'Pre-snap reads, progression speed, decision-making' },
    { key: 'release', label: 'Release Package', description: 'Route stem variety, release off the line' },
    { key: 'leverage', label: 'Leverage & Anchor', description: 'Pad level, hand placement, anchor strength' },
    { key: 'hips', label: 'Hip Fluidity', description: 'Transition quickness, turn-and-run ability' },
    { key: 'ballSkills', label: 'Ball Skills', description: 'Tracking, contested catches, interceptions' },
    { key: 'footballIQ', label: 'Football IQ', description: 'Situational awareness, scheme adaptability' },
    { key: 'tackling', label: 'Tackling', description: 'Form tackling, open-field, pursuit angles' },
    { key: 'blockShedding', label: 'Block Shedding', description: 'Hand use, violence, disengagement' },
  ],
  archetypes: [
    { key: 'pocketQB', label: 'Pocket QB', description: 'Precision passer who operates from the pocket', keyTraits: ['Arm accuracy', 'Pocket presence', 'Pre-snap reads'] },
    { key: 'dualThreatQB', label: 'Dual-Threat QB', description: 'Dynamic passer with rushing ability', keyTraits: ['Scrambling', 'Improvisation', 'RPO execution'] },
    { key: 'pressManCB', label: 'Press-Man CB', description: 'Physical corner who excels at the line', keyTraits: ['Press technique', 'Mirror ability', 'Ball skills'] },
    { key: 'downhillLB', label: 'Downhill LB', description: 'Run-stuffing linebacker who fills gaps', keyTraits: ['Downhill speed', 'Tackling', 'Block shedding'] },
    { key: 'threeAndDWing', label: '3-and-D Wing', description: 'Versatile pass catcher with deep speed', keyTraits: ['Route running', 'Speed', 'Contested catches'] },
    { key: 'mismatchTE', label: 'Mismatch TE', description: 'Hybrid tight end who creates mismatches', keyTraits: ['Size/speed combo', 'Route running', 'Red zone threat'] },
    { key: 'roadGrader', label: 'Road Grader OL', description: 'Dominant run-blocking lineman', keyTraits: ['Leverage', 'Anchor', 'Nastiness'] },
    { key: 'edgeRusher', label: 'Edge Rusher', description: 'Speed-to-power pass rush specialist', keyTraits: ['First step', 'Bend', 'Rush moves'] },
  ],
  positions: [
    { key: 'qb', label: 'Quarterback', positions: ['QB'], specificSkills: ['Arm strength', 'Accuracy', 'Processing', 'Pocket presence', 'Mobility'] },
    { key: 'wr', label: 'Wide Receiver', positions: ['WR', 'X', 'Z', 'Slot'], specificSkills: ['Route running', 'Release', 'Hands', 'Speed', 'RAC ability'] },
    { key: 'rb', label: 'Running Back', positions: ['RB', 'HB', 'FB'], specificSkills: ['Vision', 'Burst', 'Contact balance', 'Pass catching', 'Pass protection'] },
    { key: 'te', label: 'Tight End', positions: ['TE', 'H-Back', 'F'], specificSkills: ['Blocking', 'Route running', 'Hands', 'Size/speed', 'Inline ability'] },
    { key: 'ol', label: 'Offensive Line', positions: ['OT', 'OG', 'C'], specificSkills: ['Pass protection', 'Run blocking', 'Footwork', 'Anchor', 'Combo blocks'] },
    { key: 'dl', label: 'Defensive Line', positions: ['DE', 'DT', 'NT', 'EDGE'], specificSkills: ['Pass rush', 'Run defense', 'First step', 'Hand use', 'Motor'] },
    { key: 'lb', label: 'Linebacker', positions: ['ILB', 'OLB', 'LB', 'MIKE', 'WILL'], specificSkills: ['Tackling', 'Coverage', 'Blitzing', 'Instincts', 'Range'] },
    { key: 'db', label: 'Defensive Back', positions: ['CB', 'S', 'FS', 'SS', 'NB'], specificSkills: ['Coverage', 'Ball skills', 'Tackling', 'Speed', 'Instincts'] },
  ],
  evaluationCategories: ['Athleticism', 'Football IQ', 'Skill Level', 'Character', 'Academics', 'Durability'],
  redFlagIndicators: ['Injury history', 'Character concerns', 'Academic eligibility', 'Effort inconsistency', 'Scheme dependency', 'Size limitations'],
  roleFitCategories: ['Day-one starter', 'Rotational contributor', 'Developmental prospect', 'Special teams value', 'Scheme-specific fit', 'Culture fit'],
};

// ─── Basketball Pack ────────────────────────────────────────────────

export const BASKETBALL_PACK: SportPack = {
  key: 'basketball',
  label: 'Basketball',
  icon: '🏀',
  color: '#FF6B00',
  measurables: [
    { key: 'height', label: 'Height', unit: 'in', higherBetter: true },
    { key: 'wingspan', label: 'Wingspan', unit: 'in', higherBetter: true },
    { key: 'standingReach', label: 'Standing Reach', unit: 'in', higherBetter: true },
    { key: 'weight', label: 'Weight', unit: 'lbs', higherBetter: true },
    { key: 'handWidth', label: 'Hand Width', unit: 'in', higherBetter: true },
    { key: 'laneAgility', label: 'Lane Agility', unit: 's', higherBetter: false },
    { key: 'verticalLeap', label: 'Vertical Leap', unit: 'in', higherBetter: true },
    { key: 'courtSprint', label: 'Court Sprint', unit: 's', higherBetter: false },
  ],
  analytics: [
    { key: 'tsPct', label: 'TS%', unit: '%', description: 'True Shooting Percentage — shooting efficiency' },
    { key: 'usageRate', label: 'Usage Rate', unit: '%', description: 'Percentage of team possessions used' },
    { key: 'assistRate', label: 'Assist Rate', unit: '%', description: 'Percentage of teammate FGs assisted' },
    { key: 'turnoverRate', label: 'Turnover Rate', unit: '%', description: 'Turnovers per 100 possessions' },
    { key: 'defensiveActivity', label: 'Defensive Activity', unit: '', description: 'Steals + blocks + deflections per game' },
    { key: 'per', label: 'PER', unit: '', description: 'Player Efficiency Rating' },
    { key: 'reboundRate', label: 'Rebound Rate', unit: '%', description: 'Percentage of available rebounds grabbed' },
  ],
  skills: [
    { key: 'shooting', label: 'Shooting', description: 'Catch-and-shoot, pull-up, free throw, range' },
    { key: 'handle', label: 'Ball Handling', description: 'Dribble moves, PnR navigation, pressure handling' },
    { key: 'decisionMaking', label: 'Decision Making', description: 'Court vision, passing, read & react' },
    { key: 'defensiveVersatility', label: 'Defensive Versatility', description: 'Switchability, positional coverage, effort' },
    { key: 'basketballIQ', label: 'Basketball IQ', description: 'Spacing, timing, off-ball movement, rotations' },
    { key: 'finishing', label: 'Finishing', description: 'Rim finishing, floater game, contact ability' },
    { key: 'rebounding', label: 'Rebounding', description: 'Box out, positioning, outlet passing' },
  ],
  archetypes: [
    { key: 'threeAndDWing', label: '3-and-D Wing', description: 'Perimeter shooter with lockdown defense', keyTraits: ['Catch & shoot', 'Closeouts', 'Switchability'] },
    { key: 'downhillGuard', label: 'Downhill Guard', description: 'Attacking guard who gets to the rim', keyTraits: ['First step', 'Finishing at rim', 'Drawing fouls'] },
    { key: 'stretchBig', label: 'Stretch Big', description: 'Big who spaces the floor from deep', keyTraits: ['3pt shooting', 'Screen setting', 'Rim protection'] },
    { key: 'connector', label: 'Connector', description: 'Unselfish playmaker who makes others better', keyTraits: ['Passing', 'Court vision', 'Decision making'] },
    { key: 'twoWayGuard', label: 'Two-Way Guard', description: 'Elite on both ends of the floor', keyTraits: ['On-ball defense', 'Scoring', 'Versatility'] },
    { key: 'rimProtector', label: 'Rim Protector', description: 'Shot-blocking anchor of the defense', keyTraits: ['Shot blocking', 'Positioning', 'Altering shots'] },
  ],
  positions: [
    { key: 'pg', label: 'Point Guard', positions: ['PG'], specificSkills: ['Ball handling', 'Passing', 'Leadership', 'Pick & roll', 'Perimeter defense'] },
    { key: 'sg', label: 'Shooting Guard', positions: ['SG'], specificSkills: ['Shooting', 'Off-ball movement', 'Mid-range', 'Transition scoring'] },
    { key: 'sf', label: 'Small Forward', positions: ['SF', 'Wing'], specificSkills: ['Versatility', 'Cutting', 'Defensive switching', 'Rebounding'] },
    { key: 'pf', label: 'Power Forward', positions: ['PF', 'Stretch 4'], specificSkills: ['Post play', 'Face-up game', 'Defensive rebounding', 'Spacing'] },
    { key: 'c', label: 'Center', positions: ['C'], specificSkills: ['Rim protection', 'Post offense', 'Screen setting', 'Rebounding', 'Passing'] },
  ],
  evaluationCategories: ['Athleticism', 'Basketball IQ', 'Skill Level', 'Character', 'Academics', 'Motor'],
  redFlagIndicators: ['Shot selection issues', 'Defensive effort', 'Ball-stopping tendencies', 'Injury history', 'Attitude concerns', 'Size limitations'],
  roleFitCategories: ['Primary option', 'Secondary scorer', 'Defensive specialist', 'Sixth man', 'Glue guy', 'System fit'],
};

// ─── Baseball Pack ──────────────────────────────────────────────────

export const BASEBALL_PACK: SportPack = {
  key: 'baseball',
  label: 'Baseball',
  icon: '⚾',
  color: '#C41E3A',
  measurables: [
    { key: 'height', label: 'Height', unit: 'in', higherBetter: true },
    { key: 'weight', label: 'Weight', unit: 'lbs', higherBetter: true },
    { key: 'batSpeed', label: 'Bat Speed', unit: 'mph', higherBetter: true },
    { key: 'armSlot', label: 'Arm Slot', unit: '°', higherBetter: false },
    { key: 'sixtyYard', label: '60-Yard Dash', unit: 's', higherBetter: false },
    { key: 'infieldVelo', label: 'Infield Velo', unit: 'mph', higherBetter: true },
    { key: 'popTime', label: 'Pop Time', unit: 's', higherBetter: false },
  ],
  analytics: [
    { key: 'exitVelo', label: 'Exit Velocity', unit: 'mph', description: 'Average ball speed off the bat' },
    { key: 'launchAngle', label: 'Launch Angle', unit: '°', description: 'Average angle of batted ball' },
    { key: 'spinRate', label: 'Spin Rate', unit: 'rpm', description: 'Average spin rate on fastball' },
    { key: 'whiffRate', label: 'Whiff Rate', unit: '%', description: 'Swing-and-miss percentage' },
    { key: 'chasePct', label: 'Chase %', unit: '%', description: 'Swing rate at pitches outside the zone' },
    { key: 'barrelPct', label: 'Barrel %', unit: '%', description: 'Percentage of batted balls barreled' },
    { key: 'hardHitPct', label: 'Hard Hit %', unit: '%', description: 'Percentage of batted balls ≥95 mph' },
  ],
  skills: [
    { key: 'hittingApproach', label: 'Hitting Approach', description: 'Plate discipline, plan quality, adjustments' },
    { key: 'pitchRecognition', label: 'Pitch Recognition', description: 'Identifying pitch type, location, timing' },
    { key: 'fielding', label: 'Fielding', description: 'Glove work, range, first-step quickness' },
    { key: 'baserunning', label: 'Baserunning', description: 'Speed, instincts, stolen base ability' },
    { key: 'armStrength', label: 'Arm Strength', description: 'Velocity, accuracy, carry on throws' },
    { key: 'rawPower', label: 'Raw Power', description: 'Exit velo, bat speed, power potential' },
    { key: 'pitchCommand', label: 'Pitch Command', description: 'Ability to locate pitches consistently' },
  ],
  archetypes: [
    { key: 'powerBat', label: 'Power Bat', description: 'Impact hitter with elite exit velocity', keyTraits: ['Exit velo', 'Bat speed', 'Launch angle'] },
    { key: 'contactHitter', label: 'Contact Hitter', description: 'High-average hitter with plate discipline', keyTraits: ['Bat-to-ball skills', 'Plate discipline', 'Spray ability'] },
    { key: 'utilityDefender', label: 'Utility Defender', description: 'Versatile fielder who plays multiple positions', keyTraits: ['Range', 'Arm accuracy', 'Positional flexibility'] },
    { key: 'powerArm', label: 'Power Arm', description: 'Pitcher with elite velocity', keyTraits: ['Fastball velo', 'Spin rate', 'Pitch mix'] },
    { key: 'craftLefty', label: 'Crafty Lefty', description: 'Left-handed pitcher with deception and command', keyTraits: ['Command', 'Pitch sequencing', 'Deception'] },
    { key: 'twoWayPlayer', label: 'Two-Way Player', description: 'Pitches and hits at a high level', keyTraits: ['Arm strength', 'Hitting ability', 'Athletic versatility'] },
  ],
  positions: [
    { key: 'rhp', label: 'RH Pitcher', positions: ['RHP', 'SP', 'RP'], specificSkills: ['Fastball command', 'Secondary stuff', 'Mechanics', 'Durability'] },
    { key: 'lhp', label: 'LH Pitcher', positions: ['LHP', 'LHS', 'LHR'], specificSkills: ['Fastball command', 'Deception', 'Changeup', 'Pick-off move'] },
    { key: 'c', label: 'Catcher', positions: ['C'], specificSkills: ['Receiving', 'Blocking', 'Pop time', 'Game calling', 'Arm strength'] },
    { key: 'inf', label: 'Infielder', positions: ['1B', '2B', 'SS', '3B'], specificSkills: ['Glove work', 'Range', 'Arm strength', 'Double-play turns', 'Footwork'] },
    { key: 'of', label: 'Outfielder', positions: ['LF', 'CF', 'RF'], specificSkills: ['Range', 'Route running', 'Arm strength', 'Reads', 'Wall play'] },
  ],
  evaluationCategories: ['Athleticism', 'Baseball IQ', 'Skill Level', 'Character', 'Academics', 'Projectability'],
  redFlagIndicators: ['Swing-and-miss concerns', 'Arm health history', 'Defensive limitations', 'Pitch count dependency', 'Slow bat', 'Poor baserunning'],
  roleFitCategories: ['Everyday starter', 'Weekend starter (P)', 'Middle of order', 'Table setter', 'Bench depth', 'Bullpen arm'],
};

// ─── Soccer Pack ────────────────────────────────────────────────────

export const SOCCER_PACK: SportPack = {
  key: 'soccer',
  label: 'Soccer',
  icon: '⚽',
  color: '#00A859',
  measurables: [
    { key: 'speed', label: 'Top Speed', unit: 'mph', higherBetter: true },
    { key: 'stamina', label: 'Stamina (VO2max)', unit: 'ml/kg/min', higherBetter: true },
    { key: 'agility', label: 'Agility (T-Test)', unit: 's', higherBetter: false },
    { key: 'height', label: 'Height', unit: 'in', higherBetter: true },
    { key: 'weight', label: 'Weight', unit: 'lbs', higherBetter: false },
    { key: 'sprintRepeat', label: 'Repeated Sprint', unit: 's', higherBetter: false },
  ],
  analytics: [
    { key: 'xG', label: 'xG', unit: '', description: 'Expected Goals — quality of chances created/taken' },
    { key: 'xA', label: 'xA', unit: '', description: 'Expected Assists — quality of chances created for teammates' },
    { key: 'progressivePasses', label: 'Progressive Passes', unit: '/90', description: 'Forward passes that advance play per 90 min' },
    { key: 'pressures', label: 'Pressures', unit: '/90', description: 'Defensive presses applied per 90 min' },
    { key: 'recoveries', label: 'Recoveries', unit: '/90', description: 'Ball recoveries per 90 min' },
    { key: 'passCompletionPct', label: 'Pass Completion', unit: '%', description: 'Percentage of passes completed' },
    { key: 'duelWinPct', label: 'Duel Win %', unit: '%', description: 'Percentage of 1v1 duels won' },
  ],
  skills: [
    { key: 'firstTouch', label: 'First Touch', description: 'Ball control, receiving quality, body positioning' },
    { key: 'vision', label: 'Vision', description: 'Awareness, passing lanes, spatial intelligence' },
    { key: 'passingRange', label: 'Passing Range', description: 'Short, medium, long-range distribution' },
    { key: 'defensiveWorkRate', label: 'Defensive Work Rate', description: 'Pressing, tracking back, off-ball effort' },
    { key: 'dribbling', label: 'Dribbling', description: '1v1 ability, ball carrying, close control' },
    { key: 'positioning', label: 'Positioning', description: 'Off-ball movement, finding space, timing runs' },
    { key: 'aerialAbility', label: 'Aerial Ability', description: 'Heading, winning aerial duels, timing jumps' },
  ],
  archetypes: [
    { key: 'boxToBoxMid', label: 'Box-to-Box Mid', description: 'Engine of the team who covers ground both ways', keyTraits: ['Stamina', 'Tackling', 'Late runs'] },
    { key: 'invertedWinger', label: 'Inverted Winger', description: 'Cuts inside from wide to create shooting lanes', keyTraits: ['Cutting inside', 'Shooting', 'Dribbling'] },
    { key: 'targetStriker', label: 'Target Striker', description: 'Focal point of attack who holds up play', keyTraits: ['Hold-up play', 'Aerial ability', 'Finishing'] },
    { key: 'deepPlaymaker', label: 'Deep Playmaker', description: 'Dictates tempo from a deep midfield position', keyTraits: ['Passing range', 'Vision', 'Composure'] },
    { key: 'modernFullback', label: 'Modern Fullback', description: 'Overlapping wing-back with offensive contribution', keyTraits: ['Crossing', 'Speed', 'Defensive recovery'] },
    { key: 'ballPlayingCB', label: 'Ball-Playing CB', description: 'Center-back who builds from the back', keyTraits: ['Passing under pressure', 'Reading play', 'Aerial dominance'] },
  ],
  positions: [
    { key: 'gk', label: 'Goalkeeper', positions: ['GK'], specificSkills: ['Shot stopping', 'Distribution', 'Commanding area', 'Sweeping'] },
    { key: 'def', label: 'Defenders', positions: ['CB', 'LB', 'RB', 'LWB', 'RWB'], specificSkills: ['Tackling', '1v1 defending', 'Aerial duels', 'Build-up play'] },
    { key: 'mid', label: 'Midfielders', positions: ['CDM', 'CM', 'CAM', 'LM', 'RM'], specificSkills: ['Passing', 'Press resistance', 'Ball progression', 'Defensive positioning'] },
    { key: 'fwd', label: 'Forwards', positions: ['ST', 'CF', 'LW', 'RW'], specificSkills: ['Finishing', 'Movement', 'Link-up play', 'Pressing from front'] },
  ],
  evaluationCategories: ['Athleticism', 'Tactical IQ', 'Technical Skill', 'Character', 'Academics', 'Work Rate'],
  redFlagIndicators: ['Poor fitness', 'Positional indiscipline', 'Weak foot dependency', 'Struggles under pressure', 'Inconsistent effort', 'Injury history'],
  roleFitCategories: ['Starter', 'Impact sub', 'System player', 'Set piece specialist', 'Defensive anchor', 'Creative spark'],
};

// ─── Hockey Pack ────────────────────────────────────────────────────

export const HOCKEY_PACK: SportPack = {
  key: 'hockey',
  label: 'Hockey',
  icon: '🏒',
  color: '#005EB8',
  measurables: [
    { key: 'height', label: 'Height', unit: 'in', higherBetter: true },
    { key: 'weight', label: 'Weight', unit: 'lbs', higherBetter: true },
    { key: 'reach', label: 'Reach', unit: 'in', higherBetter: true },
    { key: 'skatingSpeed', label: 'Skating Speed', unit: 'mph', higherBetter: true },
    { key: 'agility', label: 'Agility', unit: 's', higherBetter: false },
    { key: 'shotSpeed', label: 'Shot Speed', unit: 'mph', higherBetter: true },
  ],
  analytics: [
    { key: 'corsi', label: 'Corsi', unit: '%', description: 'Shot-attempt differential when on ice' },
    { key: 'fenwick', label: 'Fenwick', unit: '%', description: 'Unblocked shot-attempt differential' },
    { key: 'zoneEntries', label: 'Zone Entries', unit: '/60', description: 'Controlled zone entries per 60 min' },
    { key: 'zoneExits', label: 'Zone Exits', unit: '/60', description: 'Controlled zone exits per 60 min' },
    { key: 'xGoals', label: 'Expected Goals', unit: '', description: 'Expected goals based on shot quality' },
    { key: 'pointsPer60', label: 'Points/60', unit: '', description: 'Points scored per 60 min of ice time' },
    { key: 'gaa', label: 'GAA Relative', unit: '', description: 'Goals against average relative to team (goalies)' },
  ],
  skills: [
    { key: 'skating', label: 'Skating', description: 'Speed, edges, crossovers, transitions, stride' },
    { key: 'puckHandling', label: 'Puck Handling', description: 'Stickhandling, dekes, puck protection' },
    { key: 'hockeyVision', label: 'Vision', description: 'Playmaking, passing, ice awareness' },
    { key: 'physicality', label: 'Physicality', description: 'Board play, body checking, net-front presence' },
    { key: 'shooting', label: 'Shooting', description: 'Wrist shot, slap shot, accuracy, release' },
    { key: 'defensivePlay', label: 'Defensive Play', description: 'Gap control, stick positioning, back-checking' },
    { key: 'faceoffs', label: 'Faceoffs', description: 'Faceoff win percentage and technique' },
  ],
  archetypes: [
    { key: 'twoWayCenter', label: 'Two-Way Center', description: 'Excels in both offensive and defensive zones', keyTraits: ['Faceoffs', 'Defensive positioning', 'Playmaking'] },
    { key: 'puckMovingD', label: 'Puck-Moving D', description: 'Defenseman who transitions play with passing', keyTraits: ['First pass', 'Mobility', 'Zone exit passes'] },
    { key: 'powerForward', label: 'Power Forward', description: 'Physical forward who drives to the net', keyTraits: ['Net-front presence', 'Board play', 'Shooting'] },
    { key: 'sniper', label: 'Sniper', description: 'Pure goal scorer with elite shot', keyTraits: ['Shot accuracy', 'Release speed', 'Scoring instinct'] },
    { key: 'stayAtHomeD', label: 'Stay-at-Home D', description: 'Defensive specialist who shuts down opponents', keyTraits: ['Gap control', 'Shot blocking', 'Physical play'] },
    { key: 'playmakingWinger', label: 'Playmaking Winger', description: 'Creative winger who sets up teammates', keyTraits: ['Vision', 'Passing', 'Entry skills'] },
  ],
  positions: [
    { key: 'c', label: 'Center', positions: ['C'], specificSkills: ['Faceoffs', 'Two-way play', 'Playmaking', 'Defensive responsibility'] },
    { key: 'w', label: 'Winger', positions: ['LW', 'RW'], specificSkills: ['Shooting', 'Forechecking', 'Offensive zone play', 'Speed'] },
    { key: 'd', label: 'Defenseman', positions: ['LD', 'RD'], specificSkills: ['Gap control', 'First pass', 'Physicality', 'Shot blocking', 'Point shot'] },
    { key: 'g', label: 'Goalie', positions: ['G'], specificSkills: ['Positioning', 'Rebound control', 'Lateral movement', 'Puck handling', 'Mental toughness'] },
  ],
  evaluationCategories: ['Athleticism', 'Hockey IQ', 'Skill Level', 'Character', 'Academics', 'Compete Level'],
  redFlagIndicators: ['Skating deficiency', 'Injury history', 'Compete level concerns', 'Positional discipline', 'Size vs. physicality mismatch', 'Consistency issues'],
  roleFitCategories: ['Top-line forward', 'Top-pairing D', 'Power play specialist', 'Penalty kill anchor', 'Depth contributor', 'Starter (G)'],
};

// ─── Pack Registry ──────────────────────────────────────────────────

export const SPORT_PACKS: Record<SportKey, SportPack> = {
  football: FOOTBALL_PACK,
  basketball: BASKETBALL_PACK,
  baseball: BASEBALL_PACK,
  soccer: SOCCER_PACK,
  hockey: HOCKEY_PACK,
};

export const SPORT_LIST: { key: SportKey; label: string; icon: string }[] = [
  { key: 'football', label: 'Football', icon: '🏈' },
  { key: 'basketball', label: 'Basketball', icon: '🏀' },
  { key: 'baseball', label: 'Baseball', icon: '⚾' },
  { key: 'soccer', label: 'Soccer', icon: '⚽' },
  { key: 'hockey', label: 'Hockey', icon: '🏒' },
];

/** Get the sport pack for a given sport key. Falls back to football. */
export function getSportPack(sport: SportKey): SportPack {
  return SPORT_PACKS[sport] ?? FOOTBALL_PACK;
}

/** Get positions list for a sport */
export function getPositionsForSport(sport: SportKey): string[] {
  const pack = getSportPack(sport);
  return pack.positions.flatMap((g) => g.positions);
}

/** Get the archetype label for a key */
export function getArchetypeLabel(sport: SportKey, archetypeKey: string): string {
  const pack = getSportPack(sport);
  return pack.archetypes.find((a) => a.key === archetypeKey)?.label ?? archetypeKey;
}
