import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ParentLayout from '../layouts/ParentLayout';
import {
  loadParentReflections,
  saveParentReflection,
  deleteParentReflection,
  loadSavedGuideIds,
  toggleSavedGuide,
  loadCompletedActivityIds,
  toggleCompletedActivity,
  isDailyReflectionDismissed,
  dismissDailyReflection,
  type ParentReflectionNote,
} from '../utils/parentPerspectiveStorage';

type ActiveTab = 'guide' | 'saved' | 'coach' | 'journal' | 'trust' | 'myths';

interface PerspectiveGuideItem {
  id: string;
  category: 'listening' | 'trust' | 'boundaries' | 'independence' | 'conflict' | 'emotional' | 'support';
  categoryLabel: string;
  title: string;
  summary: string;
  teenLens: string;
  constructiveApproach: string;
  starterPhrase: string;
  pitfallToAvoid: string;
}

const PERSPECTIVE_GUIDES: PerspectiveGuideItem[] = [
  {
    id: 'g_active_listening',
    category: 'listening',
    categoryLabel: 'Active Listening',
    title: 'Reflective Listening Without the Urge to Fix',
    summary: 'How to sit with a teen’s difficult feelings without immediately jumping into problem-solving mode.',
    teenLens: 'When teens vent, they are often checking if you can handle their emotion safely, not asking you to solve it.',
    constructiveApproach: 'Mirror what you hear before offering any ideas. Ask: "Do you want me to just listen, or do you want help brainstorming?"',
    starterPhrase: '"That sounds really draining. I hear why you felt frustrated. I am right here with you."',
    pitfallToAvoid: 'Offering immediate advice or saying "You should have just..." which triggers defensiveness.',
  },
  {
    id: 'g_silence_decode',
    category: 'listening',
    categoryLabel: 'Active Listening',
    title: 'Decoding Silence and One-Word Answers',
    summary: 'Navigating monosyllabic responses without turning conversations into police interrogations.',
    teenLens: 'After school, sensory and social battery is often at zero. Open-ended questions feel like emotional labor.',
    constructiveApproach: 'Offer low-pressure physical presence (food, car ride, parallel activity) rather than demanding an immediate debrief.',
    starterPhrase: '"No need to recount the day right now. Just glad you are home safe. Snack is on the counter whenever you want."',
    pitfallToAvoid: 'Pepper-spraying them with 5 questions in a row within 30 seconds of them walking through the door.',
  },
  {
    id: 'g_rebuilding_trust',
    category: 'trust',
    categoryLabel: 'Trust & Honesty',
    title: 'Rebuilding Trust After a Broken Agreement',
    summary: 'How to address broken rules or dishonesty while keeping communication channels open for the future.',
    teenLens: 'Teens often lie out of fear of catastrophic reaction or loss of dignity, rather than malice.',
    constructiveApproach: 'Separate the behavior from their character. Acknowledge the courage it takes to admit mistakes, then agree on restorative steps.',
    starterPhrase: '"I appreciate you telling me the truth now. I am upset about the broken agreement, but we can work together to rebuild trust step by step."',
    pitfallToAvoid: 'Permanent labels ("You are a liar", "I will never trust you again") which eliminate incentive to be honest.',
  },
  {
    id: 'g_collaborative_boundaries',
    category: 'boundaries',
    categoryLabel: 'Boundaries & Structure',
    title: 'Collaborative Boundaries for Tech & Screen Time',
    summary: 'Setting realistic boundaries that teens can respect because they helped shape them.',
    teenLens: 'Their phone is their entire social commons. Sudden unilateral confiscation feels like social isolation.',
    constructiveApproach: 'Agree on values-based boundaries (e.g., phones charge in the hallway at 10:30 PM for sleep health) applied fairly.',
    starterPhrase: '"We both agree sleep is essential for your mood and focus. What agreement can we set together so charging doesn’t disrupt your rest?"',
    pitfallToAvoid: 'Using phone confiscation as a quick universal punishment for unrelated issues.',
  },
  {
    id: 'g_curfew_negotiation',
    category: 'boundaries',
    categoryLabel: 'Boundaries & Structure',
    title: 'Curfew & Outing Negotiations',
    summary: 'Balancing safety with growing social freedom through transparent criteria.',
    teenLens: 'Needing to leave earlier than peers feels embarrassing and socially diminishing.',
    constructiveApproach: 'Pre-establish safety criteria: known location, reachable battery, transportation plan, and reliable check-in timing.',
    starterPhrase: '"I want you to enjoy your evening. Let’s agree on a check-in text at 9:00 PM and pick-up at 10:30 PM so we both feel comfortable."',
    pitfallToAvoid: 'Changing the rules at the last minute or making emotional guilt trips.',
  },
  {
    id: 'g_consultant_parenting',
    category: 'independence',
    categoryLabel: 'Independence & Autonomy',
    title: 'Shifting from Manager to Consultant',
    summary: 'Gradually stepping back from daily micromanagement as your teen transitions toward adulthood.',
    teenLens: 'Constant reminders feel like evidence you don’t think they are capable or responsible.',
    constructiveApproach: 'Ask permission before advising: "I have a thought on this if you’d like to hear it, but totally up to you."',
    starterPhrase: '"You are getting older and I trust your ability to manage your schedule. How would you like me to support you if you get stuck?"',
    pitfallToAvoid: 'Treating a 16-year-old like a 10-year-old by dictating every hourly task.',
  },
  {
    id: 'g_deescalation_cooling',
    category: 'conflict',
    categoryLabel: 'Conflict Resolution',
    title: 'The 20-Minute Emotional Cooling Reset',
    summary: 'Recognizing when brain physiology has entered fight-or-flight and calling a constructive pause.',
    teenLens: 'In high emotion, the amygdala takes over. Logic and rational arguments are literally inaudible.',
    constructiveApproach: 'Call a pause without stomping off or giving the silent treatment. Give both nervous systems time to regulate.',
    starterPhrase: '"We both care about this, but voices are rising. Let’s take 20 minutes to reset and come back to finish this calmly."',
    pitfallToAvoid: 'Demanding immediate compliance or following an angry teen into their room to force an immediate conversation.',
  },
  {
    id: 'g_validating_emotions',
    category: 'emotional',
    categoryLabel: 'Emotional Communication',
    title: 'Validating Emotions Before Addressing Facts',
    summary: 'Why acknowledging feelings first is the only doorway to logical problem-solving.',
    teenLens: 'Saying "It’s not a big deal" feels like you are dismissing their entire lived reality.',
    constructiveApproach: 'Validation does not mean agreement with their behavior; it means recognizing the reality of their emotion.',
    starterPhrase: '"It makes complete sense that you felt embarrassed in that situation. Tell me more about what happened."',
    pitfallToAvoid: 'Countering with "Look on the bright side" or "Other kids have it so much worse."',
  },
  {
    id: 'g_affirming_character',
    category: 'support',
    categoryLabel: 'Supportive Parenting',
    title: 'Affirming Character Over Achievement',
    summary: 'Nurturing deep self-worth rooted in integrity, resilience, and effort rather than GPA or trophies.',
    teenLens: 'Teens often feel their parents only value them when they produce impressive external results.',
    constructiveApproach: 'Notice and praise internal qualities: persistence after a setback, kindness to a sibling, honesty under pressure.',
    starterPhrase: '"I noticed how hard you worked on that project despite feeling overwhelmed. I really admire your perseverance."',
    pitfallToAvoid: 'Only celebrating grades, scores, or public accomplishments.',
  },
];

interface CoachScenario {
  id: string;
  title: string;
  trigger: string;
  teenPerspective: string;
  mindsetShift: string;
  openingLines: string[];
  listeningQuestions: string[];
  constructiveResponses: string[];
}

const COACH_SCENARIOS: CoachScenario[] = [
  {
    id: 'scen_withdrawal',
    title: 'Sudden Withdrawal & Closed Bedroom Door',
    trigger: 'Teen retreats immediately to their bedroom, shuts the door, and isolates for hours after school.',
    teenPerspective: 'They may be experiencing sensory overload, social exhaustion, or fear of judgment, needing solitude to self-regulate.',
    mindsetShift: 'Their closed door is not a personal rejection of you; it is a boundary to recover their energy.',
    openingLines: [
      '"Hey, no need to talk right now. Just wanted you to know I’m glad you’re home."',
      '"I know school days can be heavy. There are fresh snacks downstairs whenever you feel like coming down."',
      '"I’m around this evening if you want to hang out or just sit quietly together."',
    ],
    listeningQuestions: [
      '"How is your energy level right now on a scale of 1 to 10?"',
      '"Do you want company, quiet presence, or total space right now?"',
      '"Is there anything I can take off your plate today so you can rest?"',
    ],
    constructiveResponses: [
      '"Take all the quiet time you need. I’ll check in around dinner."',
      '"I respect that you need space. My door is open whenever you’re ready."',
    ],
  },
  {
    id: 'scen_academic_grades',
    title: 'Missing Assignments or Dropping Grades',
    trigger: 'An email alert arrives about a missing assignment, late project, or declining marks.',
    teenPerspective: 'They are likely already anxious, ashamed, or overwhelmed, and anticipating harsh punishment.',
    mindsetShift: 'A bad grade is a signal of a roadblock (organizational, emotional, or comprehension), not a character flaw.',
    openingLines: [
      '"I got the school update about math. Let’s sit down together when you’re ready and see where things got tangled."',
      '"I’m not angry, but I want to make sure you have the support you need. How are you feeling about that class?"',
    ],
    listeningQuestions: [
      '"Where does the process feel hardest right now—getting started, understanding the material, or finishing on time?"',
      '"What would make tackling this feel 10% less overwhelming?"',
    ],
    constructiveResponses: [
      '"Everyone hits rough patches in school. We’ll figure out a realistic study plan together."',
      '"Your grades matter, but your well-being matters more. Let’s solve the roadblock step by step."',
    ],
  },
  {
    id: 'scen_disrespect',
    title: 'Eye-Rolling, Sarcasm, or Snapping Back',
    trigger: 'A simple request or question is met with heavy sighing, muttered remarks, or rude tone.',
    teenPerspective: 'Sarcasm is often a defensive armor used when feeling micromanaged, powerless, or cornered.',
    mindsetShift: 'Address the emotion calmly without matching their sarcasm. You model regulated adulthood by staying grounded.',
    openingLines: [
      '"I can see you’re really annoyed right now. I want to hear what’s on your mind, but without the sarcastic remarks."',
      '"Let’s pause. You don’t have to like this chore, but we do need to treat each other with basic respect."',
    ],
    listeningQuestions: [
      '"What’s feeling unfair or frustrating to you right now?"',
      '"Did something happen earlier today that’s carrying over into how you feel?"',
    ],
    constructiveResponses: [
      '"I hear that you’re upset. Let’s talk about how to solve this when we’re both speaking calmly."',
      '"I value your opinion, but I won’t engage with insults. Let’s take 10 minutes and try again."',
    ],
  },
  {
    id: 'scen_friend_drama',
    title: 'Social Friendship Drama or Feeling Left Out',
    trigger: 'Teen discovers via social media that they were excluded from a group hangout or party.',
    teenPerspective: 'In adolescence, peer exclusion triggers evolutionary alarm bells resembling genuine physical pain.',
    mindsetShift: 'Do not minimize the hurt by saying "They weren’t real friends anyway." Sit in the disappointment with them.',
    openingLines: [
      '"That really stings. Seeing photos when you weren’t invited is genuinely painful. I’m so sorry."',
      '"I’m right here. You don’t have to put on a brave face with me."',
    ],
    listeningQuestions: [
      '"Do you want to talk about how it felt, or would you prefer a distraction tonight?"',
      '"Who are the friends in your circle right now who make you feel valued and safe?"',
    ],
    constructiveResponses: [
      '"You deserve friends who appreciate you. It’s okay to feel sad about this right now."',
      '"No matter what happened in that group, your worth hasn’t changed one bit."',
    ],
  },
];

const DAILY_PROMPTS = [
  'Today\'s Perspective: What is one small effort your teen made recently that took energy, even if the outcome wasn\'t flawless? Consider quietly acknowledging it.',
  'Today\'s Perspective: Next time you want to ask "Why did you do that?", try replacing it with "What were you hoping would happen?"',
  'Today\'s Perspective: Practice listening for 3 full minutes during your next conversation without offering a single piece of unsolicited advice.',
  'Today\'s Perspective: Remember that when a teen is emotional, their nervous system needs a calm anchor, not a competitive debater.',
];

const MYTHS_LIST = [
  {
    myth: 'If I don’t correct their tone right away, they’ll think they won and lose respect for me.',
    reality: 'De-escalating in the heat of the moment and addressing respect once both nervous systems are calm actually teaches emotional regulation. Escalating teaches that whoever is loudest wins.',
  },
  {
    myth: 'Teens who spend hours in their room are hiding dangerous things from their parents.',
    reality: 'Physical and emotional individuation requires private psychological space. Solitude is a normal developmental need for teenagers decompressing from high social surveillance.',
  },
  {
    myth: 'Good parents have teens who share everything with them without hesitation.',
    reality: 'Healthy adolescents naturally develop appropriate personal boundaries as they form identity. Privacy is a milestone of maturity, distinct from harmful secrecy.',
  },
  {
    myth: 'Punishments must be immediate, severe, and permanent to be effective.',
    reality: 'Harsh reactive punishment induces resentment and encourages stealth. Predictable, pre-agreed natural consequences delivered with calm neutrality build internal responsibility.',
  },
];

const GLOSSARY_TERMS = [
  {
    term: 'Active Listening',
    definition: 'Focusing entirely on understanding the speaker’s message and emotional reality, rather than preparing your rebuttal while they talk.',
  },
  {
    term: 'Emotional Attunement',
    definition: 'The ability to sense, mirror, and validate another person’s emotional state so they feel seen, safe, and understood.',
  },
  {
    term: 'Reframing',
    definition: 'Viewing a challenging behavior through a developmental or emotional lens rather than attributing it to malice or disrespect.',
  },
  {
    term: 'Consultative Parenting',
    definition: 'Shifting your role from micromanaging daily actions to being a trusted advisor who helps teens think through their own choices.',
  },
  {
    term: 'De-escalation',
    definition: 'Intentionally lowering your voice tone, body tension, and reactivity to prevent a heated disagreement from escalating into an argument.',
  },
  {
    term: 'Repairing a Conversation',
    definition: 'Returning to a conversation after an argument or mistake, apologizing for your own reaction, and re-establishing emotional connection.',
  },
];

export default function Perspective() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as ActiveTab;
  const activeTab: ActiveTab = useMemo(() => {
    const validTabs: ActiveTab[] = ['guide', 'saved', 'coach', 'journal', 'trust', 'myths'];
    return validTabs.includes(tabParam) ? tabParam : 'guide';
  }, [tabParam]);

  const handleTabChange = (newTab: ActiveTab) => {
    setSearchParams(newTab === 'guide' ? {} : { tab: newTab });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Daily reflection prompt
  const [dailyDismissed, setDailyDismissed] = useState(() => isDailyReflectionDismissed());
  const [dailyPromptText] = useState(() => {
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  });

  const handleDismissDaily = () => {
    dismissDailyReflection();
    setDailyDismissed(true);
  };

  // Saved guides & activities
  const [savedGuideIds, setSavedGuideIds] = useState<string[]>(() => loadSavedGuideIds());
  const [completedActivities, setCompletedActivities] = useState<string[]>(() => loadCompletedActivityIds());

  useEffect(() => {
    const handleGuidesUpdate = () => {
      setSavedGuideIds(loadSavedGuideIds());
    };
    window.addEventListener('storage', handleGuidesUpdate);
    window.addEventListener('twoway-saved-guides-updated', handleGuidesUpdate);
    return () => {
      window.removeEventListener('storage', handleGuidesUpdate);
      window.removeEventListener('twoway-saved-guides-updated', handleGuidesUpdate);
    };
  }, []);

  const handleToggleSaveGuide = (id: string) => {
    toggleSavedGuide(id);
    setSavedGuideIds(loadSavedGuideIds());
  };

  const handleToggleActivity = (id: string) => {
    toggleCompletedActivity(id);
    setCompletedActivities(loadCompletedActivityIds());
  };

  // Reflection Journal
  const [reflections, setReflections] = useState<ParentReflectionNote[]>(() => loadParentReflections());
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState<ParentReflectionNote['tag']>('Observation');
  const [journalFilter, setJournalFilter] = useState<string>('all');

  const handleOpenCreateNote = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTag('Observation');
    setIsCreatingNote(true);
  };

  const handleOpenEditNote = (note: ParentReflectionNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTag(note.tag);
    setIsCreatingNote(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    saveParentReflection({
      id: editingNoteId || undefined,
      title: noteTitle.trim() || 'Untitled Reflection',
      content: noteContent.trim(),
      tag: noteTag,
    });
    setReflections(loadParentReflections());
    setIsCreatingNote(false);
    setNoteTitle('');
    setNoteContent('');
    setEditingNoteId(null);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this private reflection?')) {
      deleteParentReflection(id);
      setReflections(loadParentReflections());
    }
  };

  // Coach Scenario selection & Custom scenario
  const [selectedCoachId, setSelectedCoachId] = useState<string>(COACH_SCENARIOS[0].id);
  const [customScenarioInput, setCustomScenarioInput] = useState('');
  const [customReframingResult, setCustomReframingResult] = useState<string | null>(null);

  const selectedCoach = useMemo(() => {
    return COACH_SCENARIOS.find((s) => s.id === selectedCoachId) || COACH_SCENARIOS[0];
  }, [selectedCoachId]);

  const handleCustomReframeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customScenarioInput.trim()) return;

    setCustomReframingResult(
      `Constructive Perspective on: "${customScenarioInput.trim()}"\n\n` +
      `1. Teen Lens: When emotional intensity spikes, teens prioritize autonomy and defending their dignity rather than the factual logic of the dispute.\n\n` +
      `2. Parent Reframe: Pause and separate your reaction from their emotional storm. A calm, grounded boundary offers far more psychological safety than an escalated reaction.\n\n` +
      `3. Forward Step: Validate the core feeling first, then state what you need without criticism: "I hear that you feel overwhelmed by this right now. Let’s take 15 minutes to reset and revisit this calmly."`
    );
  };

  // Filtered guides
  const filteredGuides = useMemo(() => {
    return PERSPECTIVE_GUIDES.filter((g) => {
      const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.teenLens.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.constructiveApproach.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Saved guides list
  const savedGuides = useMemo(() => {
    return PERSPECTIVE_GUIDES.filter((g) => savedGuideIds.includes(g.id));
  }, [savedGuideIds]);

  return (
    <ParentLayout>
      <div className="parent-dashboard">

        {/* HERO SECTION - MONOCHROMATIC WITH ACCENT PILL */}
        <motion.section
          className="parent-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {/* Perspective Icon: Two overlapping circles with directional arrows */}
            <svg
              width="30"
              height="24"
              viewBox="0 0 36 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Perspective icon"
            >
              <circle cx="11" cy="14" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <circle cx="25" cy="14" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <path d="M14 11L18 14L14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 11L18 14L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1>Perspective.</h1>

          <p style={{ fontSize: '1.12rem', color: 'var(--parent-text)', fontWeight: 700, margin: '4px 0 8px' }}>
            See another side. Find a better way forward.
          </p>

          <p>
            Actionable communication guides, private reflections, and real-world conversation reframing to help you connect constructively with your teen.
          </p>
        </motion.section>

        {/* DAILY REFLECTION PROMPT (DISMISSIBLE, OPTIONAL) */}
        {!dailyDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'var(--parent-surface-subtle)',
              border: '1.5px solid var(--parent-border)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 850,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--parent-accent)',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                DAILY PERSPECTIVE SPARK
              </span>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--parent-text)', lineHeight: 1.5, fontWeight: 550 }}>
                {dailyPromptText}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismissDaily}
              aria-label="Dismiss daily reflection"
              title="Dismiss for today"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--parent-text-muted)',
                fontSize: '1.25rem',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              ×
            </button>
          </motion.div>
        )}

        {/* TOP TAB NAVIGATION BAR */}
        <nav
          aria-label="Perspective Hub Navigation"
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '22px',
            borderBottom: '1.5px solid var(--parent-border)',
          }}
        >
          {[
            { id: 'guide', label: 'Perspective Guide', icon: '📖' },
            { id: 'saved', label: `Saved for Later (${savedGuideIds.length})`, icon: '★' },
            { id: 'coach', label: 'Conversation Coach', icon: '💬' },
            { id: 'journal', label: 'Reflection Journal', icon: '🔒' },
            { id: 'trust', label: 'Trust & Connection', icon: '🤝' },
            { id: 'myths', label: 'Myths & Glossary', icon: '💡' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as ActiveTab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1.5px solid var(--parent-accent)' : '1.5px solid var(--parent-border)',
                  background: isActive ? 'var(--parent-accent-soft)' : 'var(--parent-surface)',
                  color: isActive ? 'var(--parent-text)' : 'var(--parent-text-secondary)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 120ms ease',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* =========================================================
            TAB 1: PERSPECTIVE GUIDE (Categorized & Searchable)
        ========================================================= */}
        {activeTab === 'guide' && (
          <section aria-label="Perspective Guide">
            {/* SEARCH AND CATEGORY FILTER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search communication guides (e.g. listening, curfew, phone, grades)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px 11px 40px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--parent-border)',
                    background: 'var(--parent-surface)',
                    color: 'var(--parent-text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', left: '14px', top: '11px', color: 'var(--parent-text-muted)' }}>
                  🔍
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--parent-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* CATEGORY CHIPS */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'listening', label: 'Active Listening' },
                  { id: 'trust', label: 'Trust & Honesty' },
                  { id: 'boundaries', label: 'Boundaries & Rules' },
                  { id: 'independence', label: 'Independence' },
                  { id: 'conflict', label: 'Conflict Resolution' },
                  { id: 'emotional', label: 'Emotional Communication' },
                  { id: 'support', label: 'Supportive Parenting' },
                ].map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '6px',
                        border: isSelected ? '1.5px solid var(--parent-border-strong)' : '1px solid var(--parent-border)',
                        background: isSelected ? 'var(--parent-text)' : 'var(--parent-surface)',
                        color: isSelected ? 'var(--parent-bg)' : 'var(--parent-text-secondary)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GUIDES LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredGuides.length === 0 ? (
                <div className="parent-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                  <p style={{ color: 'var(--parent-text-muted)', margin: 0 }}>
                    No communication guides matched your search &quot;{searchQuery}&quot;.
                  </p>
                </div>
              ) : (
                filteredGuides.map((guide) => {
                  const isSaved = savedGuideIds.includes(guide.id);
                  return (
                    <article key={guide.id} className="parent-card">
                      <div className="parent-card-header">
                        <span className="parent-card-label">{guide.categoryLabel}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSaveGuide(guide.id)}
                          aria-label={isSaved ? 'Remove from saved guides' : 'Save guide'}
                          style={{
                            background: isSaved ? 'var(--parent-accent-soft)' : 'transparent',
                            border: '1px solid var(--parent-border)',
                            borderRadius: '6px',
                            padding: '4px 9px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: isSaved ? 'var(--parent-accent)' : 'var(--parent-text-secondary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isSaved ? '★ Saved' : '☆ Save for Later'}
                        </button>
                      </div>

                      <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{guide.title}</h2>
                      <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.92rem', marginBottom: '16px' }}>
                        {guide.summary}
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '12px',
                          marginBottom: '14px',
                        }}
                      >
                        <div
                          style={{
                            background: 'var(--parent-surface-subtle)',
                            border: '1px solid var(--parent-border)',
                            borderRadius: '8px',
                            padding: '12px 14px',
                          }}
                        >
                          <strong
                            style={{
                              display: 'block',
                              fontSize: '0.72rem',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--parent-text-muted)',
                              marginBottom: '4px',
                            }}
                          >
                            👁️ Teen Experience Lens
                          </strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--parent-text)', lineHeight: 1.5 }}>
                            {guide.teenLens}
                          </p>
                        </div>

                        <div
                          style={{
                            background: 'var(--parent-surface-subtle)',
                            border: '1px solid var(--parent-border)',
                            borderRadius: '8px',
                            padding: '12px 14px',
                          }}
                        >
                          <strong
                            style={{
                              display: 'block',
                              fontSize: '0.72rem',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--parent-text-muted)',
                              marginBottom: '4px',
                            }}
                          >
                            🧭 Constructive Approach
                          </strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--parent-text)', lineHeight: 1.5 }}>
                            {guide.constructiveApproach}
                          </p>
                        </div>
                      </div>

                      {/* STARTER PHRASE & PITFALL */}
                      <div
                        style={{
                          background: 'var(--parent-surface)',
                          borderLeft: '3.5px solid var(--parent-accent)',
                          padding: '10px 14px',
                          borderRadius: '0 8px 8px 0',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--parent-accent)',
                            marginBottom: '2px',
                          }}
                        >
                          Try Saying:
                        </span>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--parent-text)' }}>
                          {guide.starterPhrase}
                        </p>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--parent-text-muted)' }}>
                        <strong>Avoid:</strong> {guide.pitfallToAvoid}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB: SAVED FOR LATER (Retrieved bookmarked guides)
        ========================================================= */}
        {activeTab === 'saved' && (
          <section aria-label="Saved Guides">
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px', fontWeight: 800 }}>Saved Guides</h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--parent-text-secondary)' }}>
                    Your bookmarked communication strategies and conversation starters for quick reference.
                  </p>
                </div>
                {savedGuides.length > 0 && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-muted)', fontWeight: 700 }}>
                    {savedGuides.length} guide{savedGuides.length > 1 ? 's' : ''} saved
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedGuides.length === 0 ? (
                <div className="parent-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>★</div>
                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 8px' }}>No Saved Guides Yet</h3>
                  <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.55 }}>
                    When you find communication approaches or reframing guides you want to practice with your teen, tap &quot;☆ Save for Later&quot; to keep them handy here.
                  </p>
                  <button
                    type="button"
                    className="parent-btn-primary"
                    onClick={() => handleTabChange('guide')}
                  >
                    Browse Perspective Guides
                  </button>
                </div>
              ) : (
                savedGuides.map((guide) => (
                  <article key={guide.id} className="parent-card">
                    <div className="parent-card-header">
                      <span className="parent-card-label">{guide.categoryLabel}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSaveGuide(guide.id)}
                        aria-label="Remove from saved guides"
                        style={{
                          background: 'var(--parent-accent-soft)',
                          border: '1px solid var(--parent-border)',
                          borderRadius: '6px',
                          padding: '4px 9px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: 'var(--parent-accent)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        ★ Saved
                      </button>
                    </div>

                    <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{guide.title}</h2>
                    <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.92rem', marginBottom: '16px' }}>
                      {guide.summary}
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          background: 'var(--parent-surface-subtle)',
                          border: '1px solid var(--parent-border)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                        }}
                      >
                        <strong
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--parent-text-muted)',
                            marginBottom: '4px',
                          }}
                        >
                          👁️ Teen Experience Lens
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--parent-text)', lineHeight: 1.5 }}>
                          {guide.teenLens}
                        </p>
                      </div>

                      <div
                        style={{
                          background: 'var(--parent-surface-subtle)',
                          border: '1px solid var(--parent-border)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                        }}
                      >
                        <strong
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--parent-text-muted)',
                            marginBottom: '4px',
                          }}
                        >
                          🌱 Constructive Approach
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--parent-text)', lineHeight: 1.5 }}>
                          {guide.constructiveApproach}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'var(--parent-surface-subtle)',
                        borderLeft: '3px solid var(--parent-accent)',
                        borderRadius: '0 8px 8px 0',
                        padding: '12px 16px',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: 'var(--parent-text-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        Try Saying:
                      </span>
                      <p style={{ margin: 0, fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--parent-text)' }}>
                        {guide.starterPhrase}
                      </p>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--parent-text-muted)' }}>
                      <strong>Avoid:</strong> {guide.pitfallToAvoid}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 2: CONVERSATION COACH (Situation-based + Custom Reframer)
        ========================================================= */}
        {activeTab === 'coach' && (
          <section aria-label="Conversation Coach">
            {/* SITUATION SELECTOR */}
            <div className="parent-card">
              <span className="parent-card-label">CHOOSE A SCENARIO</span>
              <h2 style={{ fontSize: '1.2rem', margin: '4px 0 14px' }}>Select what you are facing right now:</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {COACH_SCENARIOS.map((scen) => {
                  const isSelected = scen.id === selectedCoachId;
                  return (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => setSelectedCoachId(scen.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--parent-accent)' : '1.5px solid var(--parent-border)',
                        background: isSelected ? 'var(--parent-accent-soft)' : 'var(--parent-surface)',
                        color: 'var(--parent-text)',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 120ms ease',
                      }}
                    >
                      {scen.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COACH DETAILS */}
            <motion.article
              key={selectedCoach.id}
              className="parent-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="parent-card-header">
                <span className="parent-card-label">COACHING BREAKDOWN</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--parent-accent)', fontWeight: 700 }}>
                  Active Scenario
                </span>
              </div>

              <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{selectedCoach.title}</h2>
              <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.9rem', marginBottom: '18px' }}>
                <strong>Typical Trigger:</strong> {selectedCoach.trigger}
              </p>

              {/* LENS & MINDSET SHIFT */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--parent-surface-subtle)', border: '1px solid var(--parent-border)', borderRadius: '8px', padding: '14px' }}>
                  <strong style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--parent-text-muted)', marginBottom: '4px' }}>
                    What Might Be Going On
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.55 }}>
                    {selectedCoach.teenPerspective}
                  </p>
                </div>

                <div style={{ background: 'var(--parent-surface-subtle)', border: '1px solid var(--parent-border)', borderRadius: '8px', padding: '14px' }}>
                  <strong style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--parent-accent)', marginBottom: '4px' }}>
                    Parent Mindset Shift
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.55 }}>
                    {selectedCoach.mindsetShift}
                  </p>
                </div>
              </div>

              {/* OPENING LINES */}
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  1. Constructive Opening Lines
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCoach.openingLines.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'var(--parent-surface)',
                        border: '1px solid var(--parent-border)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                      }}
                    >
                      💬 {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* LISTENING QUESTIONS */}
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Curious Listening Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCoach.listeningQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'var(--parent-surface)',
                        border: '1px solid var(--parent-border)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                      }}
                    >
                      ❓ {q}
                    </div>
                  ))}
                </div>
              </div>

              {/* RESPONSES */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  3. Constructive Responses &amp; Boundaries
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCoach.constructiveResponses.map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: 'var(--parent-surface)',
                        borderLeft: '3px solid var(--parent-border-strong)',
                        borderTop: '1px solid var(--parent-border)',
                        borderRight: '1px solid var(--parent-border)',
                        borderBottom: '1px solid var(--parent-border)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                      }}
                    >
                      🛡️ {r}
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>

            {/* CUSTOM SCENARIO REFRAMER (EXISTING FUNCTIONALITY PRESERVED & POLISHED) */}
            <div className="parent-card">
              <span className="parent-card-label">CUSTOM REFRAMER</span>
              <h2 style={{ fontSize: '1.2rem', margin: '4px 0 10px' }}>Have a specific situation in mind?</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--parent-text-secondary)', marginBottom: '16px' }}>
                Describe what happened or what you want to discuss. Receive a step-by-step constructive breakdown.
              </p>

              <form onSubmit={handleCustomReframeSubmit}>
                <textarea
                  rows={3}
                  value={customScenarioInput}
                  onChange={(e) => setCustomScenarioInput(e.target.value)}
                  placeholder="e.g. My teen asked to stay out until 1 AM with friends I haven't met yet and slammed the door when I asked questions..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--parent-border)',
                    background: 'var(--parent-surface)',
                    color: 'var(--parent-text)',
                    fontSize: '0.88rem',
                    marginBottom: '12px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />

                <button
                  type="submit"
                  className="parent-btn-primary"
                  disabled={!customScenarioInput.trim()}
                >
                  Generate Constructive Perspective →
                </button>
              </form>

              {customReframingResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '20px',
                    padding: '16px 18px',
                    borderRadius: '8px',
                    background: 'var(--parent-surface-subtle)',
                    border: '1.5px solid var(--parent-border-strong)',
                    whiteSpace: 'pre-line',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: 'var(--parent-text)',
                  }}
                >
                  {customReframingResult}
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 3: REFLECTION JOURNAL (Private Parent Notes)
        ========================================================= */}
        {activeTab === 'journal' && (
          <section aria-label="Reflection Journal">
            {/* PRIVACY PLEDGE BANNER */}
            <div
              style={{
                background: 'var(--parent-surface-subtle)',
                border: '1.5px solid var(--parent-border)',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>🔒</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.86rem', color: 'var(--parent-text)' }}>
                  Private Parent-Only Notes
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--parent-text-secondary)' }}>
                  Your reflections are stored locally on your device only. They are never shared with your teen, other family members, or counselors.
                </span>
              </div>
            </div>

            {/* ACTION HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['all', 'Breakthrough', 'Tough Moment', 'Boundary', 'Personal Growth', 'Observation'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setJournalFilter(t)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: journalFilter === t ? '1.5px solid var(--parent-border-strong)' : '1px solid var(--parent-border)',
                      background: journalFilter === t ? 'var(--parent-text)' : 'var(--parent-surface)',
                      color: journalFilter === t ? 'var(--parent-bg)' : 'var(--parent-text-secondary)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {t === 'all' ? 'All Notes' : t}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="parent-btn-primary"
                onClick={handleOpenCreateNote}
                style={{ fontSize: '0.82rem', padding: '8px 16px' }}
              >
                + New Private Note
              </button>
            </div>

            {/* CREATE / EDIT FORM MODAL */}
            <AnimatePresence>
              {isCreatingNote && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="parent-card"
                  style={{ border: '2px solid var(--parent-accent)' }}
                >
                  <div className="parent-card-header">
                    <span className="parent-card-label">
                      {editingNoteId ? 'EDIT REFLECTION' : 'NEW PRIVATE REFLECTION'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNote(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--parent-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSaveNote}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 750, marginBottom: '6px' }}>
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Conversation after dinner tonight..."
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--parent-border)',
                          background: 'var(--parent-surface)',
                          color: 'var(--parent-text)',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 750, marginBottom: '6px' }}>
                        Category Tag
                      </label>
                      <select
                        value={noteTag}
                        onChange={(e) => setNoteTag(e.target.value as ParentReflectionNote['tag'])}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--parent-border)',
                          background: 'var(--parent-surface)',
                          color: 'var(--parent-text)',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      >
                        <option value="Breakthrough">Breakthrough</option>
                        <option value="Tough Moment">Tough Moment</option>
                        <option value="Boundary">Boundary</option>
                        <option value="Personal Growth">Personal Growth</option>
                        <option value="Observation">Observation</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 750, marginBottom: '6px' }}>
                        What went well? What could be handled differently next time?
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Write your honest, private thoughts here. No one else has access..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--parent-border)',
                          background: 'var(--parent-surface)',
                          color: 'var(--parent-text)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="parent-btn-primary" style={{ fontSize: '0.84rem' }}>
                        {editingNoteId ? 'Update Reflection' : 'Save Private Note'}
                      </button>
                      <button
                        type="button"
                        className="parent-btn-secondary"
                        onClick={() => setIsCreatingNote(false)}
                        style={{ fontSize: '0.84rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* NOTES LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reflections
                .filter((n) => journalFilter === 'all' || n.tag === journalFilter)
                .length === 0 ? (
                <div className="parent-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                  <p style={{ color: 'var(--parent-text-secondary)', margin: '0 0 12px' }}>
                    No private reflections saved yet.
                  </p>
                  <button
                    type="button"
                    className="parent-btn-secondary"
                    onClick={handleOpenCreateNote}
                    style={{ fontSize: '0.82rem' }}
                  >
                    Record your first reflection
                  </button>
                </div>
              ) : (
                reflections
                  .filter((n) => journalFilter === 'all' || n.tag === journalFilter)
                  .map((note) => (
                    <article key={note.id} className="parent-card">
                      <div className="parent-card-header">
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 850,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--parent-accent)',
                            background: 'var(--parent-accent-soft)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {note.tag}
                        </span>

                        <span style={{ fontSize: '0.74rem', color: 'var(--parent-text-muted)' }}>
                          {new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>{note.title}</h3>
                      <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--parent-text)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {note.content}
                      </p>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          className="parent-btn-ghost"
                          onClick={() => handleOpenEditNote(note)}
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="parent-btn-ghost"
                          onClick={() => handleDeleteNote(note.id)}
                          style={{ fontSize: '0.78rem', padding: '4px 10px', color: '#DC2626', borderColor: '#DC2626' }}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
              )}
            </div>
          </section>
        )}

        {/* =========================================================
            TAB 4: TRUST & CONNECTION (Starters, Activities, Challenges)
        ========================================================= */}
        {activeTab === 'trust' && (
          <section aria-label="Trust and Connection">
            {/* WEEKLY MICRO-CHALLENGE */}
            <div className="parent-card" style={{ border: '2px solid var(--parent-accent)' }}>
              <span className="parent-card-label" style={{ color: 'var(--parent-accent)' }}>
                FEATURED COMMUNICATION CHALLENGE
              </span>
              <h2 style={{ fontSize: '1.25rem', margin: '4px 0 8px' }}>
                The 48-Hour &quot;Fix-Free&quot; Challenge
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--parent-text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                For the next 48 hours, whenever your teen shares a complaint, frustration, or story, commit to not offering a single unsolicited piece of advice or solution. Only offer active empathy and validation.
              </p>

              <div
                style={{
                  background: 'var(--parent-surface-subtle)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.84rem' }}>Challenge Status</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--parent-text-muted)' }}>
                    {completedActivities.includes('act_48hr_challenge') ? 'Completed! Great job.' : 'In progress · Tap when finished'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActivity('act_48hr_challenge')}
                  className={completedActivities.includes('act_48hr_challenge') ? 'parent-btn-primary' : 'parent-btn-secondary'}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  {completedActivities.includes('act_48hr_challenge') ? '✓ Mark Complete' : 'Mark as Done'}
                </button>
              </div>
            </div>

            {/* CONVERSATION STARTERS */}
            <div className="parent-card">
              <span className="parent-card-label">CONVERSATION STARTERS</span>
              <h2 style={{ fontSize: '1.2rem', margin: '4px 0 10px' }}>Low-Pressure Car &amp; Dinner Questions</h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--parent-text-secondary)', marginBottom: '14px' }}>
                Questions that invite genuine opinion rather than feeling like performance tests.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'What is something people your age assume adults understand, but we actually don’t?',
                  'If you could delete one social media app from existence, which one would it be?',
                  'What was the most ridiculous thing that happened in school this week?',
                  'If you could plan our Saturday dinner with zero budget limit, what are we eating?',
                  'What is a song you have been listening to on repeat recently? Can we listen to it in the car?',
                ].map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '8px',
                      background: 'var(--parent-surface-subtle)',
                      border: '1px solid var(--parent-border)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      color: 'var(--parent-text)',
                    }}
                  >
                    💬 {q}
                  </div>
                ))}
              </div>
            </div>

            {/* FAMILY CONNECTION ACTIVITIES */}
            <div className="parent-card">
              <span className="parent-card-label">CONNECTION ACTIVITIES</span>
              <h2 style={{ fontSize: '1.2rem', margin: '4px 0 10px' }}>Parallel &amp; Low-Pressure Moments</h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--parent-text-secondary)', marginBottom: '14px' }}>
                Teens often open up easiest during side-by-side (parallel) activities where direct eye contact isn’t demanded.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {[
                  {
                    id: 'act_music_swap',
                    title: 'The Playlist Swap',
                    desc: 'Pick 3 favorite tracks each during a drive and explain why they resonate with you without criticism.',
                  },
                  {
                    id: 'act_cooking',
                    title: 'Late Night Cooking',
                    desc: 'Make grilled cheese or bake cookies together after 8 PM with zero agenda or school questions.',
                  },
                  {
                    id: 'act_walk',
                    title: 'Side-by-Side 15m Walk',
                    desc: 'A simple walk around the block. Physical movement helps discharge tension without face-to-face pressure.',
                  },
                  {
                    id: 'act_movie',
                    title: 'Their Movie Pick',
                    desc: 'Watch their favorite movie or YouTube creator without giving running commentary or moral critiques.',
                  },
                ].map((act) => {
                  const isDone = completedActivities.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: isDone ? '1.5px solid var(--parent-accent)' : '1px solid var(--parent-border)',
                        background: isDone ? 'var(--parent-accent-soft)' : 'var(--parent-surface)',
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: '4px' }}>
                        {act.title}
                      </strong>
                      <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: 'var(--parent-text-secondary)', lineHeight: 1.5 }}>
                        {act.desc}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleToggleActivity(act.id)}
                        className={isDone ? 'parent-btn-primary' : 'parent-btn-secondary'}
                        style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                      >
                        {isDone ? '✓ Completed' : 'Mark Completed'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}



        {/* =========================================================
            TAB 6: MYTHS VS REALITY & GLOSSARY
        ========================================================= */}
        {activeTab === 'myths' && (
          <section aria-label="Myths and Glossary">
            {/* MYTHS VS REALITY */}
            <div className="parent-card">
              <span className="parent-card-label">FACT CHECK</span>
              <h2 style={{ fontSize: '1.25rem', margin: '4px 0 14px' }}>Common Myths vs. Constructive Reality</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {MYTHS_LIST.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--parent-border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--parent-surface-subtle)',
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--parent-border)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 850,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#DC2626',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        ❌ Common Myth
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--parent-text)' }}>
                        {item.myth}
                      </strong>
                    </div>

                    <div style={{ padding: '12px 14px', background: 'var(--parent-surface)' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 850,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'var(--parent-accent)',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        ✓ Constructive Reality
                      </span>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--parent-text-secondary)', lineHeight: 1.55 }}>
                        {item.reality}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMMUNICATION GLOSSARY */}
            <div className="parent-card">
              <span className="parent-card-label">COMMUNICATION GLOSSARY</span>
              <h2 style={{ fontSize: '1.25rem', margin: '4px 0 14px' }}>Key Terms Simply Explained</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {GLOSSARY_TERMS.map((term, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--parent-border)',
                      background: 'var(--parent-surface-subtle)',
                    }}
                  >
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--parent-text)', marginBottom: '4px' }}>
                      {term.term}
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--parent-text-secondary)', lineHeight: 1.5 }}>
                      {term.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* EDUCATIONAL DISCLAIMER BANNER (Distinguishing from clinical therapy) */}
        <footer
          style={{
            marginTop: '36px',
            padding: '16px 18px',
            border: '1px solid var(--parent-border)',
            borderRadius: '8px',
            background: 'var(--parent-surface-subtle)',
            fontSize: '0.78rem',
            color: 'var(--parent-text-muted)',
            lineHeight: 1.55,
          }}
        >
          <strong>Educational Notice:</strong> Perspective provides educational communication frameworks and reflective prompts for everyday family dialogue. It does not provide clinical therapy, medical advice, or psychiatric treatment. If you, your teen, or your family require professional mental health care or crisis intervention, please consult a licensed healthcare professional.
        </footer>

      </div>
    </ParentLayout>
  );
}
