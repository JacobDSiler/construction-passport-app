import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadJson, saveJson } from './storage';
import { Worker, blankWorker, getShortCode, loadWorker, saveWorker, publishWorker, Qualification } from './passport';
import { TS_KEY, TsEvent, newId, EventKind } from './timesheet';
import { addTimesheetEvent, deleteTimesheetEvent } from './api';
import { Access, getAccess } from './entitlements';
import { getStamp } from './photos';

interface Store {
  ready: boolean;
  worker: Worker;
  events: TsEvent[];
  shortCode: string | null;
  access: Access | null;
  updateWorker: (patch: Partial<Worker>) => void;
  upsertQualification: (q: Qualification) => void;
  removeQualification: (id: string) => void;
  addEvent: (kind: EventKind, opts?: { at?: Date; note?: string; stamp?: boolean }) => Promise<void>;
  removeEvent: (id: string) => void;
  publish: () => Promise<string>;
  reload: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [worker, setWorker] = useState<Worker>(blankWorker());
  const [events, setEvents] = useState<TsEvent[]>([]);
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [access, setAccess] = useState<Access | null>(null);
  const republishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workerRef = useRef(worker);
  workerRef.current = worker;
  const codeRef = useRef<string | null>(null);
  codeRef.current = shortCode;

  const reload = useCallback(async () => {
    const w = await loadWorker();
    setWorker(w);
    await saveWorker(w); // makes sure a stable CP number exists from first launch
    setEvents(await loadJson<TsEvent[]>(TS_KEY, []));
    setShortCode(await getShortCode());
    setAccess(await getAccess());
    setReady(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Any passport change updates the shared copy, once the passport has been shared before.
  const scheduleRepublish = useCallback(() => {
    if (!codeRef.current) return;
    if (republishTimer.current) clearTimeout(republishTimer.current);
    republishTimer.current = setTimeout(() => {
      publishWorker(workerRef.current)
        .then(({ worker: w }) => {
          setWorker(w);
          saveWorker(w);
        })
        .catch(() => {});
    }, 2500);
  }, []);

  const commitWorker = useCallback(
    (next: Worker) => {
      setWorker(next);
      saveWorker(next);
      scheduleRepublish();
    },
    [scheduleRepublish],
  );

  const updateWorker = useCallback((patch: Partial<Worker>) => commitWorker({ ...workerRef.current, ...patch }), [commitWorker]);

  const upsertQualification = useCallback(
    (q: Qualification) => {
      const cur = workerRef.current;
      const exists = cur.qualifications.some((x) => x.id === q.id);
      commitWorker({ ...cur, qualifications: exists ? cur.qualifications.map((x) => (x.id === q.id ? q : x)) : [...cur.qualifications, q] });
    },
    [commitWorker],
  );

  const removeQualification = useCallback(
    (id: string) => commitWorker({ ...workerRef.current, qualifications: workerRef.current.qualifications.filter((q) => q.id !== id) }),
    [commitWorker],
  );

  const addEvent = useCallback(async (kind: EventKind, opts: { at?: Date; note?: string; stamp?: boolean } = {}) => {
    const ev: TsEvent = { id: newId(), kind, at: (opts.at ?? new Date()).toISOString(), note: opts.note?.trim() || undefined };
    setEvents((prev) => {
      const next = [...prev, ev];
      saveJson(TS_KEY, next);
      return next;
    });
    // Date/GPS stamp for live clock events only (back-dated entries have no real location).
    if (opts.stamp !== false && !opts.at) {
      const s = await getStamp();
      if (s.lat != null) {
        ev.lat = s.lat;
        ev.lng = s.lng;
        setEvents((prev) => {
          const next = prev.map((e) => (e.id === ev.id ? { ...e, lat: s.lat, lng: s.lng } : e));
          saveJson(TS_KEY, next);
          return next;
        });
      }
    }
    if (codeRef.current) {
      addTimesheetEvent({ shortCode: codeRef.current, kind, at: ev.at, note: ev.note })
        .then((res) => {
          if (typeof res === 'string' || typeof res === 'number') {
            setEvents((prev) => {
              const next = prev.map((e) => (e.id === ev.id ? { ...e, remoteId: res } : e));
              saveJson(TS_KEY, next);
              return next;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const eventsRef = useRef(events);
  eventsRef.current = events;
  const removeEvent = useCallback((id: string) => {
    const gone = eventsRef.current.find((e) => e.id === id);
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveJson(TS_KEY, next);
      return next;
    });
    if (gone?.remoteId != null) deleteTimesheetEvent(gone.remoteId).catch(() => {});
  }, []);

  const publish = useCallback(async () => {
    const { code, worker: w } = await publishWorker(workerRef.current);
    setWorker(w);
    saveWorker(w);
    setShortCode(code);
    return code;
  }, []);

  const value = useMemo<Store>(
    () => ({ ready, worker, events, shortCode, access, updateWorker, upsertQualification, removeQualification, addEvent, removeEvent, publish, reload }),
    [ready, worker, events, shortCode, access, updateWorker, upsertQualification, removeQualification, addEvent, removeEvent, publish, reload],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
