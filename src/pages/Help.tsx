import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'How do I install the app on my phone?',
        a: 'iPhone: Open the app URL in Safari, tap the Share button, then "Add to Home Screen." Android: Open in Chrome, tap the menu (three dots), then "Add to Home Screen" or "Install App."',
      },
      {
        q: 'Do I need an internet connection?',
        a: 'No. The app works fully offline. All data is stored on your device. When a server is available, data will sync automatically.',
      },
    ],
  },
  {
    title: 'Tracking Time',
    items: [
      {
        q: 'How do I start a timer?',
        a: 'Tap "Start Timer" on the dashboard, pick a category (On-Site, Remote, or Travel), and the timer begins. You can pause, resume, or stop it at any time.',
      },
      {
        q: 'What if I forget to start the timer?',
        a: 'Use "Log Time" to manually enter time after the fact. Pick the date, category, and enter the duration using the stepper (15-minute increments) or by setting start/end times.',
      },
      {
        q: 'What if my browser crashes while the timer is running?',
        a: 'The timer saves a checkpoint every 30 seconds. When you reopen the app, you\'ll see a prompt to resume, save, or discard the recovered timer.',
      },
      {
        q: 'What counts against the 90-hour allotment?',
        a: 'Everything: on-site work, remote work, and travel time (train from Providence to Penn Station, driving, etc.). The dashboard gauge tracks your total against the monthly allotment.',
      },
    ],
  },
  {
    title: 'Tracking Expenses',
    items: [
      {
        q: 'How do I log an expense?',
        a: 'Tap "Add Expense" on the dashboard. Pick a category, enter the amount, optionally add a vendor name and receipt photo.',
      },
      {
        q: 'How does mileage tracking work?',
        a: 'When you select "Fuel / Tolls," toggle to "Log Mileage" mode. Enter miles driven and the app calculates the amount using the IRS mileage rate ($0.70/mile for 2026). You can adjust the rate in Settings.',
      },
      {
        q: 'Can I take a photo of my receipt?',
        a: 'Yes. On the Add Expense screen, tap "Take Photo" to use your camera or "Choose File" to pick from your photo library. The image is stored locally on your device.',
      },
    ],
  },
  {
    title: 'Editing & Deleting',
    items: [
      {
        q: 'How do I edit an entry?',
        a: 'Tap any entry in the Recent Activity section on the dashboard, or go to History and tap the entry or the "Edit" link. You can change the date, category, duration/amount, and notes.',
      },
      {
        q: 'How do I delete an entry?',
        a: 'In History, tap "Delete" on the entry, then confirm. This cannot be undone.',
      },
    ],
  },
  {
    title: 'Dashboard & Reports',
    items: [
      {
        q: 'What do the gauge colors mean?',
        a: 'Gold means you\'re on track. It turns coral (orange) at 80% of your allotment and red at 95% as a warning that you\'re approaching the limit.',
      },
      {
        q: 'What does the location split bar show?',
        a: 'It shows the proportion of your hours spent on-site (gold), remote (teal), and traveling (coral) for the current month.',
      },
      {
        q: 'How do I export my data?',
        a: 'Go to Settings and tap "Export All Data (JSON)." This downloads a backup file with all your time entries and expenses.',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        q: 'How do I change my profile info?',
        a: 'Go to Settings and edit your name, email, role, and organization. Tap "Save Settings" when done.',
      },
      {
        q: 'How do I change the monthly hour allotment?',
        a: 'Go to Settings, update the "Monthly Hour Allotment" field, and tap "Save Settings." The dashboard gauge will update immediately.',
      },
    ],
  },
];

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-4">
      <h2 className="text-lg font-semibold text-text-light">How To / FAQ</h2>
      <p className="text-sm text-text-muted">
        Quick answers for using Fallon Tracker on the Nunez Remediation project.
      </p>

      {sections.map(section => (
        <div key={section.title} className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-gold font-semibold">{section.title}</h3>
          {section.items.map((item, i) => (
            <details key={i} className="bg-forest-deep rounded-xl group">
              <summary className="px-4 py-3 text-sm font-medium text-text-light cursor-pointer list-none flex items-center justify-between min-h-[44px]">
                <span>{item.q}</span>
                <span className="text-text-muted group-open:rotate-180 transition-transform ml-2 shrink-0">&#9662;</span>
              </summary>
              <p className="px-4 pb-3 text-sm text-text-muted leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      ))}

      <button
        onClick={() => navigate('/settings')}
        className="w-full border border-text-muted/30 text-text-light font-medium py-3 rounded-xl text-sm active:scale-[0.97] transition-transform min-h-[44px]"
      >
        Back to Settings
      </button>
    </div>
  );
}
