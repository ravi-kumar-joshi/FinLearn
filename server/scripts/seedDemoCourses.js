/**
 * Seeds published demo courses for local development / QA.
 *
 * Requires MONGO_URL (or MONGODB_URI) in server/.env
 *
 *   cd server && npm run seed
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Course = require("../models/Course.js");

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI;

/** Rich HTML snippets for LessonView */
const DEMO_COURSES = [
  {
    courseId: "demo-course-budgeting-basics-v1",
    title: "Budgeting Basics — Demo",
    slug: "budgeting-basics-demo",
    description:
      "Learn how to create and maintain a monthly budget. Hands-on demo course with quizzes.",
    category: "Budgeting",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec5110165b?w=1200&h=600&fit=crop",
    instructor: "FinLearn Academy",
    duration: 150,
    rating: 4.8,
    totalEnrollments: 1240,
    isPublished: true,
    modules: [
      {
        id: "mod-intro-budgeting",
        title: "Introduction to Budgeting",
        order: 1,
        description: "Why budgets matter and how to get started.",
        xpReward: 100,
        lessons: [
          {
            id: "les-what-is-budget",
            title: "What is a budget?",
            duration: 10,
            xpReward: 25,
            content: `
              <p>A <strong>budget</strong> is a plan for your income and spending over a period (usually a month).</p>
              <p>It helps you see where money goes, avoid overspending, and fund goals intentionally.</p>
              <p>Think of it as a map—not a restriction. You choose the destinations (goals) and the route (allocations).</p>
            `,
            videoUrl: null,
            resources: [
              {
                title: "RBI — Financial literacy basics",
                url: "https://www.rbi.org.in/",
              },
            ],
            quiz: {
              questions: [
                {
                  id: "q1",
                  question: "What is the main purpose of a personal budget?",
                  options: [
                    "To spend as much as possible",
                    "To plan income and expenses intentionally",
                    "To avoid all discretionary spending",
                    "To replace a bank account",
                  ],
                  correctAnswer: 1,
                  explanation:
                    "A budget helps you align spending with priorities and avoid running out of money before priorities are covered.",
                },
                {
                  id: "q2",
                  question: "How often do most people review a monthly budget?",
                  options: [
                    "Once every five years",
                    "Only when they get a raise",
                    "Regularly (e.g. monthly or weekly check-ins)",
                    "Never—set it once only",
                  ],
                  correctAnswer: 2,
                  explanation: "Regular reviews keep the budget realistic as income and expenses change.",
                },
              ],
            },
          },
          {
            id: "les-income-and-fixed-costs",
            title: "Income & fixed costs",
            duration: 12,
            xpReward: 25,
            content: `
              <p>Start with <strong>net income</strong> (what actually hits your account each month).</p>
              <p>List <strong>fixed costs</strong>: rent/EMI, utilities, subscriptions, loan minimums—the amounts that recur and are hard to trim short-term.</p>
              <p>Subtract fixed costs from income. What remains covers variable spending and savings.</p>
            `,
            resources: [],
            quiz: {
              questions: [
                {
                  id: "q3",
                  question: "Which of these is typically a fixed cost?",
                  options: [
                    "Dining out on weekends",
                    "Rent or home loan EMI",
                    "Holiday shopping",
                    "Impulse buys",
                  ],
                  correctAnswer: 1,
                  explanation: "Fixed costs recur on a predictable schedule with similar amounts.",
                },
              ],
            },
          },
        ],
      },
      {
        id: "mod-502030",
        title: "The 50/30/20 Rule",
        order: 2,
        description: "A simple split for needs, wants, and savings.",
        xpReward: 120,
        lessons: [
          {
            id: "les-split-explained",
            title: "How the split works",
            duration: 15,
            xpReward: 30,
            content: `
              <p>The <strong>50/30/20</strong> guideline suggests:</p>
              <ul>
                <li><strong>50%</strong> — needs (housing, groceries, utilities, transport, minimum debt)</li>
                <li><strong>30%</strong> — wants (dining out, hobbies, subscriptions you could cut)</li>
                <li><strong>20%</strong> — savings & extra debt paydown</li>
              </ul>
              <p>Adapt percentages if your costs are higher in expensive cities—the idea is balance, not rigid math.</p>
            `,
            resources: [],
            quiz: {
              questions: [
                {
                  id: "q4",
                  question: "In 50/30/20, the 50% slice is primarily for:",
                  options: ["Wants", "Needs", "Emergency fund only", "Taxes only"],
                  correctAnswer: 1,
                  explanation: "The largest slice covers essential needs.",
                },
                {
                  id: "q5",
                  question: "The 20% slice prioritises:",
                  options: [
                    "Luxury purchases",
                    "Savings and accelerated debt payoff",
                    "Only entertainment",
                    "Only groceries",
                  ],
                  correctAnswer: 1,
                  explanation: "20% fuels future you: savings and reducing high-interest debt.",
                },
              ],
            },
          },
          {
            id: "les-adjusting",
            title: "Adjusting the rule",
            duration: 10,
            xpReward: 25,
            content: `
              <p>If needs exceed 50%, trim wants first, then look for realistic ways to reduce needs over time (roommates, refinance, commute changes).</p>
              <p>If you have irregular income (freelancing), budget from a conservative “typical low” month and build a cushion.</p>
            `,
            quiz: {
              questions: [
                {
                  id: "q6",
                  question: "If your fixed needs are temporarily above 50%, a sensible first step is:",
                  options: [
                    "Ignore the budget",
                    "Review wants and discretionary spending first",
                    "Stop paying rent",
                    "Double credit card spending",
                  ],
                  correctAnswer: 1,
                  explanation: "Wants are usually the quickest place to regain balance.",
                },
              ],
            },
          },
        ],
      },
      {
        id: "mod-tracking",
        title: "Tracking spending",
        order: 3,
        description: "Build habits to stay on track.",
        xpReward: 100,
        lessons: [
          {
            id: "les-tracking-habits",
            title: "Weekly money check-in",
            duration: 12,
            xpReward: 30,
            content: `
              <p>Pick a recurring time (Sunday evening, payday +2 days) to:</p>
              <ol>
                <li>Categorise last week’s spending against your buckets.</li>
                <li>Flag one leak (subscription, impulse category).</li>
                <li>Set one tweak for next week.</li>
              </ol>
              <p>Small corrections beat a perfect spreadsheet you never open.</p>
            `,
            quiz: {
              questions: [
                {
                  id: "q7",
                  question: "Why are short weekly reviews useful?",
                  options: [
                    "They replace the need to save",
                    "They catch overspending early while habits are fresh",
                    "They guarantee investment returns",
                    "They eliminate taxes",
                  ],
                  correctAnswer: 1,
                  explanation: "Frequent lightweight reviews beat rare deep dives.",
                },
                {
                  id: "q8",
                  question: "A “spending leak” usually means:",
                  options: [
                    "A fixed rent payment",
                    "A recurring or impulse category creeping above plan",
                    "Paying EMI on time",
                    "Funding an emergency buffer",
                  ],
                  correctAnswer: 1,
                  explanation: "Leaks are areas where discretionary spend drifts up unnoticed.",
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    courseId: "demo-course-savings-starter-v1",
    title: "Savings Starter — Demo",
    slug: "savings-starter-demo",
    description: "Emergency buffer goals and automatic savings—in a short guided path.",
    category: "Savings",
    difficulty: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop",
    instructor: "FinLearn Academy",
    duration: 45,
    rating: 4.6,
    totalEnrollments: 820,
    isPublished: true,
    modules: [
      {
        id: "mod-why-save",
        title: "Why save first?",
        order: 1,
        description: "Short-term stability before investing.",
        xpReward: 80,
        lessons: [
          {
            id: "les-emergency-fund",
            title: "Emergency fund basics",
            duration: 12,
            xpReward: 30,
            content: `
              <p>An <strong>emergency fund</strong> covers income loss or large unexpected bills without debt.</p>
              <p>Many households aim for <strong>3–6 months</strong> of essential expenses—not luxury spending—in liquid savings.</p>
              <p>Start small: one month of essentials is far better than zero.</p>
            `,
            quiz: {
              questions: [
                {
                  id: "s1",
                  question: "What is an emergency fund mainly for?",
                  options: [
                    "Planned vacations",
                    "Shopping sales",
                    "Unexpected essential expenses or income loss",
                    "Speculative trading",
                  ],
                  correctAnswer: 2,
                  explanation: "Use it for true emergencies, not predictable wants.",
                },
              ],
            },
          },
          {
            id: "les-automation",
            title: "Automate the first transfer",
            duration: 8,
            xpReward: 25,
            content: `
              <p>Schedule a recurring transfer right after payday—<strong>pay yourself first</strong>.</p>
              <p>Even 5–10% builds habit; you can raise the amount as expenses stabilise.</p>
            `,
            quiz: {
              questions: [
                {
                  id: "s2",
                  question: "“Pay yourself first” usually means:",
                  options: [
                    "Spend on wants before bills",
                    "Move savings automatically before discretionary spending",
                    "Ignore loan payments",
                    "Only use cash",
                  ],
                  correctAnswer: 1,
                  explanation: "Automation reduces the chance savings get skipped.",
                },
              ],
            },
          },
        ],
      },
    ],
  },
];

async function seed() {
  if (!MONGO_URI) {
    console.error("Set MONGO_URL or MONGODB_URI in server/.env before seeding.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log("Connected.");

  for (const doc of DEMO_COURSES) {
    const mins = doc.modules.reduce(
      (t, m) => t + m.lessons.reduce((s, l) => s + (Number(l.duration) || 0), 0),
      0
    );
    const duration = mins || doc.duration;

    const result = await Course.findOneAndUpdate(
      { slug: doc.slug },
      {
        ...doc,
        duration,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();

    console.log(`— ${doc.title}  id=${result._id}`);
  }

  console.log(`Done. Seeded ${DEMO_COURSES.length} demo course(s) by slug.`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
