import { Notification, NotificationType, NotificationPriority } from '../types';
import { Log } from '../services/log.service';

// In-memory datastore acting as our database
let notifications: Notification[] = [];

/**
 * Seed notifications with realistic academic/placement notifications
 */
function seedNotifications(): void {
  const priorities: Record<NotificationType, NotificationPriority> = {
    Event: 1,
    Result: 2,
    Placement: 3,
  };

  const seedPayloads = [
    {
      type: 'Placement',
      title: 'Google Software Engineering Internships 2026',
      message: 'Applications are now open for the summer internship cohort. Candidates must apply through the portal. Requirements: Proficiency in Data Structures, Algorithms, and at least one systems programming language.'
    },
    {
      type: 'Result',
      title: 'Advanced Algorithms Mid-Term Exam Grades Published',
      message: 'Grades for the Mid-Term exam have been released. The class average is 74.2%. Re-evaluation requests must be submitted to the department office by Friday.'
    },
    {
      type: 'Event',
      title: 'Tech Seminar: Optimizing Web Performance',
      message: 'Join us in Auditorium A at 2:00 PM for an expert talk on Core Web Vitals, HTTP/3, and Edge Computing architectures. Light refreshments will be served.'
    },
    {
      type: 'Placement',
      title: 'Microsoft SDE-1 Campus Recruitment Drive',
      message: 'Microsoft will be conducting its online assessment for the SDE-1 role. Registration closes on June 22nd. Please upload your updated resume.'
    },
    {
      type: 'Result',
      title: 'Global Hackathon 2026 Runner-Up Announcement',
      message: 'Congratulations to our university team (ByteBusters) for securing second place in the Global FinTech Hackathon in Berlin! The prize ceremony is on Monday.'
    },
    {
      type: 'Event',
      title: 'Annual Sports Tournament: Registration Open',
      message: 'Register for football, basketball, cricket, and indoor athletics. Forms are available at the student sports council desk. Registration deadline is June 28th.'
    },
    {
      type: 'Placement',
      title: 'Amazon AWS Cloud Support Associate Shortlist',
      message: 'Amazon has released the list of shortlisted candidates for the interview phase. Shortlisted students must report to Seminar Hall 2 at 9:00 AM.'
    },
    {
      type: 'Result',
      title: 'Machine Learning Term Project Evaluation Grades',
      message: 'Final grades for the ML term projects have been uploaded. Individual feedback reports from the professors have been emailed to group leaders.'
    },
    {
      type: 'Event',
      title: 'Rust & Systems Programming Hands-on Workshop',
      message: 'A two-day intensive workshop covering Rust fundamentals, memory safety, ownership, lifetime semantics, and concurrent coding practices.'
    },
    {
      type: 'Placement',
      title: 'Adobe UX/UI Designer Opportunities',
      message: 'Adobe is hiring junior designers. Candidates are required to submit their Behance/Dribbble design portfolio links during application.'
    },
    {
      type: 'Result',
      title: 'Mathematics Olympiad Selection Trials Results',
      message: 'The list of students selected to represent the university in the upcoming regional math olympiad is posted on the notice board.'
    },
    {
      type: 'Event',
      title: 'Guest Lecture: Quantum Computing Architectures',
      message: 'Dr. Evelyn Carter will give a lecture on superconducting qubits and quantum error correction codes. Open to all engineering disciplines.'
    },
    {
      type: 'Placement',
      title: 'Goldman Sachs Analyst Program Applications',
      message: 'Goldman Sachs is visiting for campus placements. Open to Computer Science, Math, and Finance majors. Register by tomorrow noon.'
    },
    {
      type: 'Result',
      title: 'Database Systems Laboratory Evaluations Completed',
      message: 'Lab evaluation sheets are finalized. Students can verify their marks with the respective lab instructors during office hours.'
    },
    {
      type: 'Event',
      title: 'Inter-College Coding Championship (CodeSprint)',
      message: 'Registrations are open for the annual CodeSprint tournament. Total cash prizes worth $10,000. Prepare your teams of three!'
    },
    {
      type: 'Placement',
      title: 'NVIDIA Hardware Engineering Internship Openings',
      message: 'NVIDIA is hiring internships for VLSI and Hardware architecture roles. Pre-placement talks will be streamed online.'
    },
    {
      type: 'Result',
      title: 'Graduate Scholarship Program Results',
      message: 'The university scholarship board has announced the recipients of the 2026 Academic Excellence Grants. Award letters will be sent next week.'
    },
    {
      type: 'Event',
      title: 'Alumni Panel Discussion: Careers in AI & Robotics',
      message: 'A networking session and panel discussion featuring alumni working at OpenAI, Tesla, and Boston Dynamics. Sign up on the career cell page.'
    },
    {
      type: 'Placement',
      title: 'Uber Software Engineering Placement Drive',
      message: 'Uber is visiting campus for frontend, backend, and full-stack engineering roles. Apply before the registration portal locks.'
    },
    {
      type: 'Result',
      title: 'Physics Lab Quiz-1 Marks Released',
      message: 'Marks for Quiz-1 are posted on the physics department notice board. Class average is 65%.'
    }
  ];

  const baseTime = new Date();
  notifications = seedPayloads.map((payload, index) => {
    // Space out notifications chronologically (every 4 hours)
    const timestamp = new Date(baseTime.getTime() - index * 4 * 60 * 60 * 1000);
    return {
      id: `notif-uuid-${index + 1}`,
      title: payload.title,
      message: payload.message,
      type: payload.type as NotificationType,
      priority: priorities[payload.type as NotificationType],
      isRead: index % 4 === 0, // Mark some as already read to make dashboard visualization realistic
      createdAt: timestamp.toISOString()
    };
  });

  Log('backend', 'info', 'db', `Mock Database Seeded: Loaded ${notifications.length} notifications`);
}

// Initialize seed data
seedNotifications();

export const NotificationRepository = {
  /**
   * Fetch paginated notifications with filters and search
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  }): Promise<{ notifications: Notification[]; total: number }> {
    Log('backend', 'debug', 'repository', `findAll query: ${JSON.stringify(options)}`);

    const page = options.page || 1;
    const limit = options.limit || 10;
    const { type, search } = options;

    let filtered = [...notifications];

    // Filter by type
    if (type && type !== 'All') {
      filtered = filtered.filter((n) => n.type.toLowerCase() === type.toLowerCase());
    }

    // Filter by search string
    if (search && search.trim() !== '') {
      const keyword = search.toLowerCase().trim();
      filtered = filtered.filter(
        (n) => n.title.toLowerCase().includes(keyword) || n.message.toLowerCase().includes(keyword)
      );
    }

    // Sort chronologically by default (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      notifications: paginated,
      total
    };
  },

  /**
   * Find notification by ID
   */
  async findById(id: string): Promise<Notification | null> {
    Log('backend', 'debug', 'repository', `findById query for ID: ${id}`);
    const notification = notifications.find((n) => n.id === id);
    return notification ? { ...notification } : null;
  },

  /**
   * Update read status of a notification
   */
  async updateReadStatus(id: string, isRead: boolean): Promise<Notification | null> {
    Log('backend', 'info', 'repository', `Updating notification ${id} read status to ${isRead}`);
    const index = notifications.findIndex((n) => n.id === id);

    if (index === -1) {
      Log('backend', 'warn', 'repository', `Notification ${id} not found for read update`);
      return null;
    }

    notifications[index].isRead = isRead;
    notifications[index].readAt = isRead ? new Date().toISOString() : undefined;

    return { ...notifications[index] };
  },

  /**
   * Get stats counts for notifications dashboard
   */
  async getStats(): Promise<{
    total: number;
    unread: number;
    events: number;
    results: number;
    placements: number;
  }> {
    Log('backend', 'debug', 'repository', 'Calculating notifications statistics');
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const events = notifications.filter((n) => n.type === 'Event').length;
    const results = notifications.filter((n) => n.type === 'Result').length;
    const placements = notifications.filter((n) => n.type === 'Placement').length;

    return {
      total,
      unread,
      events,
      results,
      placements
    };
  },

  /**
   * Get all raw notifications (required by priority heap algorithm)
   */
  getAllRaw(): Notification[] {
    Log('backend', 'debug', 'repository', 'Retrieving raw notification list');
    return notifications.map((n) => ({ ...n }));
  }
};
