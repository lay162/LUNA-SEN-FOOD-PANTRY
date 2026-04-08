import {
  buildEmptySchedule,
  buildNext14Days,
  fillScheduleByWeekdayPattern,
} from '../utils/teamAvailabilityUtils';
import { DEMO_MODE } from '../../../utils/demoMode';

function onboardingDocFields() {
  return {
    drivingLicenceProofDataUrl: '',
    drivingLicenceProofFileName: '',
    insuranceProofDataUrl: '',
    insuranceProofFileName: '',
    dbsProofDataUrl: '',
    dbsProofFileName: '',
  };
}

function serviceAndProgressionFields() {
  return {
    familiesServedCount: 0,
    deliveriesCompletedCount: 0,
    supportNeedsFlag: false,
    supportNeedsNotes: '',
    progressionStage: 'Active',
    recognitionNotes: '',
  };
}

/**
 * Demo roster slots for the next 14 days so admin “Show availability” is meaningful before My rota sync.
 * Real volunteers still override via `luna-team-availability-v1` / Firestore by email.
 */
export function createVolunteersTeamSeed() {
  // Production: start with no seed volunteers (real data comes from Firebase or admin input).
  return [];
}
