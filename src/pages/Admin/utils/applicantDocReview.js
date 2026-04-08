function isDeliveryApplicant(a) {
  const r = a?.roleApplied;
  return r === 'delivery' || r === 'driver';
}

/** Driver has either uploaded licence or committed to show it in person. */
export function applicantDrivingLicencePathMet(a) {
  if (!isDeliveryApplicant(a)) return true;
  const hasFile = Boolean(String(a.drivingLicenceProofDataUrl || '').trim() && a.drivingLicenceProofFileName);
  return hasFile || Boolean(a.bringDrivingLicenceInPerson);
}

/** Driver has either uploaded insurance or committed to show it in person. */
export function applicantInsurancePathMet(a) {
  if (!isDeliveryApplicant(a)) return true;
  const hasFile = Boolean(String(a.insuranceProofDataUrl || '').trim() && a.insuranceProofFileName);
  return hasFile || Boolean(a.bringInsuranceInPerson);
}

/** Applicant said they will show DBS evidence in person, or uploaded a file. */
export function applicantDbsCommitted(a) {
  const hasFile = Boolean(String(a.dbsProofDataUrl || '').trim() && a.dbsProofFileName);
  return hasFile || Boolean(a.bringDbsInPerson);
}

/** Lauren can tick “documents reviewed” only when driver compliance docs are satisfied. */
export function applicantCanMarkDocumentsReviewed(a) {
  return applicantInsurancePathMet(a) && applicantDrivingLicencePathMet(a);
}

/** “Application received” → next stage requires founder review. Later stages do not. */
export function applicantNeedsFounderDocReviewToAdvance(a) {
  return a.stage === 'application-received';
}

export function applicantCanAdvanceStage(a) {
  if (!applicantNeedsFounderDocReviewToAdvance(a)) return true;
  return Boolean(a.founderDocsVerified);
}

/** Required before someone can become an onboarded volunteer. */
export function applicantMeetsOnboardingDocRequirements(a) {
  if (!applicantDbsCommitted(a)) return false;
  if (isDeliveryApplicant(a)) {
    return applicantInsurancePathMet(a) && applicantDrivingLicencePathMet(a);
  }
  return true;
}

/** For dashboard / list badges */
export function applicantDocReviewLabel(a) {
  if (a.stage !== 'application-received') return null;
  if (!applicantInsurancePathMet(a)) return { tone: 'blocked', text: 'Insurance needed' };
  if (!applicantDrivingLicencePathMet(a)) return { tone: 'blocked', text: 'Licence needed' };
  if (!a.founderDocsVerified) return { tone: 'pending', text: 'Awaiting review' };
  return { tone: 'ok', text: 'Docs reviewed' };
}
