import policy from '../assets/config/membership-policy.json' with { type: 'json' };
export { policy };
const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9_.-]{1,120}$/.test(value);
/** Internal domain function. Evidence must come from authenticated server validators or the DB,
 * NEVER directly from request.json(). This is not an authentication or anti-bot boundary. */
export function evaluateStampAward({ member, stampKey, evidence = [], project, now = Date.now() }) {
  const denied = reason => ({ eligible: false, reason });
  if (!member || !safeId(member.id) || member.status !== 'active' || member.emailVerified !== true) return denied('verified_member_required');
  const definition = policy.stamps.find(s => s.key === stampKey);
  if (!definition) return denied('unknown_stamp');
  const seen = new Set();
  const facts = evidence.filter(e => {
    if (!e || e.memberId !== member.id || e.verified !== true || e.source !== definition.source ||
        typeof e.key !== 'string' || !e.key || e.key.length > 300 || seen.has(e.key) ||
        !Number.isFinite(e.verifiedAt) || e.verifiedAt > now || e.verifiedAt < 0) return false;
    seen.add(e.key); return true;
  });
  let eligible = false, key = definition.key, name = definition.name;
  if (definition.official) {
    const required = key === 'abn-approved' ? 'abn_approver' : 'maab_approver';
    eligible = facts.some(e => e.kind === 'official_grant' && e.stampKey === key && safeId(e.actorId) && e.actorRoles?.includes(required) && safeId(e.approvalId));
  } else if (definition.kind === 'listen') {
    // One receipt per at-most-15-second interval, with playhead seek jumps excluded upstream.
    eligible = facts.filter(e => e.kind === 'listen' && e.sessionAuthorized === true && e.forwardPlayback === true && e.audible === true && e.visible === true && Number.isFinite(e.seconds) && e.seconds > 0 && e.seconds <= 15)
      .reduce((n,e) => n + e.seconds, 0) >= definition.need;
  } else if (definition.kind === 'dig' || definition.kind === 'city') {
    eligible = new Set(facts.filter(e => e.kind === definition.kind && safeId(e.subjectId) && e.seconds >= definition.minimumSeconds).map(e => e.subjectId)).size >= definition.need;
  } else if (definition.kind === 'cut') {
    eligible = facts.filter(e => e.kind === 'cut' && e.manual === true && e.sessionAuthorized === true && e.playing === true).length >= definition.need;
  } else if (definition.repeat === 'per-project') {
    if (!project || !safeId(project.id) || typeof project.title !== 'string' || !project.title.trim() || project.title.length > 180 || project.downloadEligible !== true) return denied('eligible_project_required');
    eligible = facts.some(e => e.kind === 'project_download' && e.subjectId === project.id && e.entitlementChecked === true && e.deliveryStarted === true);
    key = 'project:' + project.id; name = project.title;
  }
  if (!eligible) return denied('requirements_not_met');
  return { eligible: true, memberId: member.id, stampId: key, name, version: policy.version,
    credits: definition.credits, eventKey: JSON.stringify(['stamp', member.id, key, policy.version]), evidenceKeys: facts.map(e => e.key) };
}
/** Daily-cap admission belongs inside the same transaction as the award; never check then write. */
export function rewardPeriod(at = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: policy.timezone, year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(at));
}
