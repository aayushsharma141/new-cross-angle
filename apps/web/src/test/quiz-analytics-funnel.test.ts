import { describe, it, expect } from 'vitest';
import {
  buildSessionsFromEvents,
  computeFunnel,
  computeDropoffs,
  computeArchetypeBreakdown,
  STAGE_ORDER,
  type EventRow,
} from '@/components/admin/analytics/analytics-utils';

/**
 * The Style Quiz funnel showed an identical count for every stage and an
 * always-empty drop-off list. Two causes, both guarded here:
 *
 *  1. Sessions were expanded from daily quiz_started/quiz_completed totals, so a
 *     finished session carried last_stage "results" (incrementing every stage)
 *     and an unfinished one carried null (incrementing none).
 *  2. STAGE_ORDER held snake_case names from a retired quiz version, so no stage
 *     the live quiz emits ("PhysicalSpace", "VisualInstinct", …) ever resolved.
 */

let seq = 0;
const ev = (
  sessionId: string,
  event_type: string,
  payload: Record<string, unknown> = {}
): EventRow => ({
  id: `e${seq++}`,
  analytics_session_id: sessionId,
  event_type,
  stage_name: typeof payload.stepName === 'string' ? payload.stepName : null,
  meta: payload,
  created_at: new Date(Date.UTC(2026, 8, 1, 0, 0, seq)).toISOString(),
});

/** One session that starts, views stages up to `lastStage`, and optionally finishes. */
function journey(id: string, lastStage: string, opts: { completed?: boolean; mode?: string; archetype?: string } = {}) {
  const events: EventRow[] = [
    ev(id, 'quiz_started', { sessionId: id, mode: opts.mode ?? 'deep', userAgent: 'Mozilla/5.0 (Macintosh) Chrome/120' }),
  ];
  for (const stage of STAGE_ORDER.slice(0, STAGE_ORDER.indexOf(lastStage) + 1)) {
    events.push(ev(id, 'quiz_step_viewed', { sessionId: id, stepName: stage }));
  }
  if (opts.completed) {
    events.push(ev(id, 'quiz_completed', { sessionId: id, archetype: opts.archetype ?? 'The Minimalist', totalSeconds: 240 }));
  }
  return events;
}

describe('Style Quiz funnel', () => {
  // Three abandon early, one goes the distance.
  const events = [
    ...journey('s1', 'PhysicalSpace'),
    ...journey('s2', 'PhysicalSpace'),
    ...journey('s3', 'VisualInstinct'),
    ...journey('s4', 'Results', { completed: true, archetype: 'The Classicist' }),
  ];
  const sessions = buildSessionsFromEvents(events);

  it('rebuilds one session per sessionId with its furthest stage', () => {
    expect(sessions).toHaveLength(4);
    expect(sessions.find((s) => s.id === 's1')?.last_stage).toBe('PhysicalSpace');
    expect(sessions.find((s) => s.id === 's4')?.is_completed).toBe(true);
    expect(sessions.find((s) => s.id === 's4')?.completion_time_seconds).toBe(240);
    expect(sessions.find((s) => s.id === 's1')?.user_agent).toContain('Chrome');
  });

  it('decreases down the funnel instead of reporting every stage equally', () => {
    const funnel = computeFunnel(sessions);
    const at = (stage: string) => funnel.find((f) => f.stage === stage)!;

    expect(at('Welcome').count).toBe(4);
    expect(at('PhysicalSpace').count).toBe(4);
    expect(at('Timeline').count).toBe(2); // s1 and s2 stopped
    expect(at('VisualInstinct').count).toBe(2);
    expect(at('ReinterpretationGate').count).toBe(1); // s3 stopped
    expect(at('Results').count).toBe(1);

    const counts = funnel.map((f) => f.count);
    expect(new Set(counts).size).toBeGreaterThan(1);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts); // never increases
  });

  it('attributes each loss to the stage where it happened', () => {
    const funnel = computeFunnel(sessions);
    const timeline = funnel.find((f) => f.stage === 'Timeline')!;
    expect(timeline.droppedFromPrev).toBe(2);
    expect(timeline.dropPctFromPrev).toBe(50);
    expect(funnel.find((f) => f.stage === 'Welcome')!.droppedFromPrev).toBe(0);
  });

  it('lists the stages people abandoned on', () => {
    const dropoffs = computeDropoffs(sessions);
    expect(dropoffs).not.toHaveLength(0);
    expect(dropoffs[0]).toMatchObject({ stage: 'PhysicalSpace', count: 2 });
    expect(dropoffs.some((d) => d.stage === 'Results')).toBe(false);
  });

  it('counts the archetype of completed sessions only', () => {
    expect(computeArchetypeBreakdown(sessions)).toEqual([{ name: 'The Classicist', value: 1 }]);
  });

  it('counts a quick-mode session that skipped stages by how far it got', () => {
    const quick = buildSessionsFromEvents([
      ...journey('q1', 'Welcome', { mode: 'quick' }),
      ev('q1', 'quiz_step_viewed', { sessionId: 'q1', stepName: 'BudgetAlignment' }),
    ]);
    const funnel = computeFunnel(quick);
    // Skipped middle stages still count as reached — the session passed them.
    expect(funnel.find((f) => f.stage === 'Timeline')!.count).toBe(1);
    expect(funnel.find((f) => f.stage === 'BudgetAlignment')!.count).toBe(1);
    expect(funnel.find((f) => f.stage === 'Results')!.count).toBe(0);
  });

  it('ignores events with no session id', () => {
    expect(buildSessionsFromEvents([{ ...ev('x', 'quiz_started'), analytics_session_id: null }])).toHaveLength(0);
  });
});
