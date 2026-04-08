import { createContext, useContext } from 'react';

export const TeamRecruitmentContext = createContext(null);

export function useTeamRecruitment() {
  const ctx = useContext(TeamRecruitmentContext);
  if (!ctx) {
    throw new Error('useTeamRecruitment must be used within VolunteerRecruitmentLayout');
  }
  return ctx;
}
