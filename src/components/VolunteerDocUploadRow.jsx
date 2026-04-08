import React, { useRef } from 'react';
import { readVolunteerDocument } from '../utils/volunteerDocFile';

/**
 * Photo/PDF upload with separate “Take photo” (camera on supported devices).
 */
export default function VolunteerDocUploadRow({
  idPrefix,
  label,
  description,
  dataUrl,
  fileName,
  onChange,
  error,
}) {
  const fileRef = useRef(null);
  const camRef = useRef(null);

  const handlePick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const next = await readVolunteerDocument(f);
      onChange(next);
    } catch (err) {
      window.alert(err?.message || 'Could not use that file.');
    }
  };

  const clear = () => onChange({ dataUrl: '', fileName: '' });

  const isPdf = dataUrl?.startsWith('data:application/pdf');
  const isImg = dataUrl?.startsWith('data:image');

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-gray-800">{label}</span>
      {description ? <p className="text-sm text-gray-600 leading-relaxed">{description}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          id={`${idPrefix}-file`}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handlePick}
        />
        <input
          ref={camRef}
          id={`${idPrefix}-cam`}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePick}
        />
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-700 shadow-sm transition hover:bg-gray-50"
          onClick={() => fileRef.current?.click()}
        >
          Choose file
        </button>
        <button
          type="button"
          className="rounded-lg border border-pink-200 bg-gradient-to-r from-pink-500 to-sky-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:opacity-95"
          onClick={() => camRef.current?.click()}
        >
          Take photo
        </button>
        {dataUrl && fileName ? (
          <button
            type="button"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-800 transition hover:bg-red-100"
            onClick={clear}
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {fileName ? <p className="text-xs font-medium text-gray-500">{fileName}</p> : null}
      {isImg ? (
        <img src={dataUrl} alt="" className="max-h-44 max-w-full rounded-lg border border-gray-200 object-contain" />
      ) : null}
      {isPdf ? (
        <a
          href={dataUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-semibold text-pink-600 underline-offset-2 hover:underline"
        >
          Open PDF in new tab
        </a>
      ) : null}
    </div>
  );
}
