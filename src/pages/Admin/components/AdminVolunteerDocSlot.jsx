import React, { useRef } from 'react';
import { readVolunteerDocument } from '../../../utils/volunteerDocFile';

/**
 * View + replace proof documents in applicant / volunteer modals.
 */
export default function AdminVolunteerDocSlot({
  label,
  dataUrl,
  fileName,
  onUploaded,
  onClear,
  chooseId,
  cameraId,
}) {
  const fileRef = useRef(null);
  const camRef = useRef(null);

  const handlePick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const next = await readVolunteerDocument(f);
      onUploaded(next);
    } catch (err) {
      window.alert(err?.message || 'Could not use that file.');
    }
  };

  const isPdf = dataUrl?.startsWith('data:application/pdf');
  const isImg = dataUrl?.startsWith('data:image');

  return (
    <div className="admin-panel__applicant-detail__doc-slot">
      <p className="admin-panel__applicant-detail__doc-slot-label">{label}</p>
      {dataUrl && fileName ? (
        <div className="admin-panel__applicant-detail__doc-slot-body">
          <p className="admin-panel__applicant-detail__doc-filename">{fileName}</p>
          {isImg ? (
            <a href={dataUrl} target="_blank" rel="noopener noreferrer" className="admin-panel__applicant-detail__doc-thumb-wrap">
              <img src={dataUrl} alt="" className="admin-panel__applicant-detail__doc-preview" />
            </a>
          ) : null}
          {isPdf ? (
            <a
              href={dataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-panel__btn admin-panel__btn--soft admin-panel__applicant-detail__doc-open"
            >
              Open PDF
            </a>
          ) : null}
        </div>
      ) : (
        <p className="admin-panel__applicant-detail__doc-empty">No file uploaded yet.</p>
      )}
      <input
        ref={fileRef}
        id={chooseId}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        onChange={handlePick}
      />
      <input
        ref={camRef}
        id={cameraId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handlePick}
      />
      <div className="admin-panel__applicant-detail__doc-actions">
        <button type="button" className="admin-panel__btn admin-panel__btn--outline admin-panel__referral-strip__btn" onClick={() => fileRef.current?.click()}>
          Choose file
        </button>
        <button type="button" className="admin-panel__btn admin-panel__btn--primary admin-panel__referral-strip__btn" onClick={() => camRef.current?.click()}>
          Take photo
        </button>
        {dataUrl && fileName ? (
          <button type="button" className="admin-panel__btn admin-panel__btn--outline admin-panel__referral-strip__btn admin-panel__referral-strip__btn--danger" onClick={onClear}>
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
