import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CircleUserRound,
  ExternalLink,
  Globe2,
  MapPin,
  MessageCircle,
  Plus,
  Star,
  Users,
} from "lucide-react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { SiGroupme } from "react-icons/si";
import type { Club } from "../clubview/ClubListingsPage";

import "./ClubDetail.css";

type ClubDetailProps = {
  onBack: () => void;
  club?: Club;
};

const contactIcons = {
  instagram: FaInstagram,
  discord: FaDiscord,
  groupme: SiGroupme,
  website: Globe2,
};

const commitmentDetails = {
  none: { label: "No commitment", detail: "Drop in whenever you want" },
  low: { label: "Low commitment", detail: "Events every once in a while" },
  moderate: { label: "Moderate commitment", detail: "A few hours each week" },
  high: { label: "High commitment", detail: "3–5 hours each week" },
  serious: { label: "Serious commitment", detail: "6+ hours each week" },
};

type SubmittedReview = {
  id: string;
  date: string;
  dateTime: string;
  commitment: number;
  enjoyment: number;
  body: string;
};

const commitmentLabels = ["Low", "Light", "Moderate", "High", "Serious"];

const mockReviews = [
  {
    id: "mock-review-1",
    date: "May 12, 2026",
    dateTime: "2026-05-12",
    schoolYear: "Third-year",
    body: "Everyone is willing to teach. I joined without experience and had a project to show off by the end of the quarter.",
  },
  {
    id: "mock-review-2",
    date: "April 28, 2026",
    dateTime: "2026-04-28",
    schoolYear: "Fourth-year",
    body: "A great balance of build nights, competition prep, and a genuinely fun group of people.",
  },
];

function loadSubmittedReviews(storageKey: string): SubmittedReview[] {
  try {
    const savedReviews = localStorage.getItem(storageKey);
    return savedReviews ? JSON.parse(savedReviews) : [];
  } catch {
    return [];
  }
}

export function ClubDetail({ onBack, club }: ClubDetailProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [commitment, setCommitment] = useState(3);
  const [enjoyment, setEnjoyment] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const clubName = club?.name ?? "Cal Poly Robotics";
  const clubDescription = club?.description ?? "A hands-on community for students who want to design, build, and compete with robots together.";
  const clubTags = club?.tags ?? ["Engineering", "Robotics", "Build teams"];
  const commitmentLevel = club?.commitment ?? "moderate";
  const commitmentInfo = commitmentDetails[commitmentLevel];
  const contactLinks = club?.contactLinks ?? [];
  const reviewStorageKey = `clubrate:reviews:${club?.id ?? "cal-poly-robotics"}`;
  const [submittedReviews, setSubmittedReviews] = useState<SubmittedReview[]>(() =>
    loadSubmittedReviews(reviewStorageKey),
  );

  useEffect(() => {
    setSubmittedReviews(loadSubmittedReviews(reviewStorageKey));
  }, [reviewStorageKey]);

  function closeReviewDialog() {
    setReviewOpen(false);
    setReviewError(null);
  }

  function submitReview() {
    const note = comment.trim();

    if (enjoyment === 0) {
      setReviewError("Choose a star rating before posting your review.");
      return;
    }

    if (!note) {
      setReviewError("Write a short note before posting your review.");
      return;
    }

    const now = new Date();
    const newReview: SubmittedReview = {
      id: crypto.randomUUID(),
      date: now.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
      dateTime: now.toISOString(),
      commitment,
      enjoyment,
      body: note,
    };
    const nextReviews = [newReview, ...submittedReviews];

    setSubmittedReviews(nextReviews);
    try {
      localStorage.setItem(reviewStorageKey, JSON.stringify(nextReviews));
    } catch {
      // The review remains visible for this visit if browser storage is unavailable.
    }

    setCommitment(3);
    setEnjoyment(0);
    setComment("");
    closeReviewDialog();
  }

  return (
    <main className="club-detail">
      <div className="club-detail__content">
        <button className="club-detail__back" type="button" onClick={onBack}>
          <ArrowLeft size={17} /> Back to clubs
        </button>

        <section className="club-detail__hero" aria-labelledby="club-title">
          <div className="club-detail__mark" aria-hidden="true">CR</div>
          <div className="club-detail__headline">
            <h1 id="club-title">{clubName}</h1>
            <div className="club-detail__tags" aria-label="Club tags">
              {clubTags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
          <button
            className="club-detail__review-button"
            type="button"
            onClick={() => setReviewOpen(true)}
          >
            <Plus size={18} /> Add a review
          </button>
        </section>

        <div className="club-detail__grid">
          <section className="detail-card club-detail__description">
            <p>{clubDescription}</p>
          </section>

          <div className="club-detail__right-rail">
            <section className="detail-card club-detail__official">
              <div className="detail-card__heading">
                <div>
                  <div className="detail-card__title">
                    <h2>Official details</h2>
                    <span
                      className="club-detail__info-tip"
                      tabIndex={0}
                      aria-label="Some of these details were submitted by the club."
                      data-tooltip="Some of these details were submitted by the club."
                    >
                      i
                    </span>
                  </div>
                </div>
                <span className="club-detail__updated">Updated this month</span>
              </div>
              <div className="club-detail__facts">
                <div><MapPin size={18} /><span><b>Meeting room</b>14-0233</span></div>
                <div><CalendarDays size={18} /><span><b>Established</b>Fall 2016</span></div>
                <div><Users size={18} /><span><b>Open to</b>All majors</span></div>
                <div><Clock3 size={18} /><span><b>Meets</b>Thursdays at 6 PM</span></div>
              </div>
              <div className="club-detail__commitment-summary">
                <span className={`club-detail__commitment-dot club-detail__commitment-dot--${commitmentLevel}`} aria-hidden="true" />
                <div><b>{commitmentInfo.label}</b><p>{commitmentInfo.detail}</p></div>
              </div>
            </section>

            <section className="detail-card club-detail__community" aria-label="Community details">
              <div className="detail-card__title">
                <h2>Community details</h2>
                <span
                  className="club-detail__info-tip"
                  tabIndex={0}
                  aria-label="These details were submitted by members of the campus community."
                  data-tooltip="These details were submitted by members of the campus community."
                >
                  i
                </span>
              </div>
              <div className="club-detail__community-metrics">
                <div className="club-detail__community-metric">
                  <b>Enjoyment</b>
                  <span className="club-detail__score" aria-label="Enjoyment rating">★★★★</span>
                </div>
                <div className="club-detail__community-metric">
                  <b>Commitment</b>
                  <div className="club-detail__community-commitment">
                    <span className={`club-detail__commitment-dot club-detail__commitment-dot--${commitmentLevel}`} aria-hidden="true" />
                    <span>{commitmentInfo.label}</span>
                  </div>
                </div>
              </div>
            </section>

            {contactLinks.length > 0 && (
              <aside className="detail-card club-detail__contact">
                <h2>Connect with the club</h2>
                <div className="club-detail__contact-icons">
                  {contactLinks.map((contact) => {
                    const Icon = contactIcons[contact.platform];
                    return (
                      <a
                        key={contact.platform}
                        href={contact.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={contact.platform}
                        title={contact.platform}
                      >
                        <Icon size={22} aria-hidden="true" />
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </aside>
            )}
          </div>

          <section className="detail-card club-detail__comments">
            <div className="detail-card__heading">
              <div><h2>Reviews</h2></div>
              <MessageCircle size={21} aria-hidden="true" />
            </div>
            {[...submittedReviews, ...mockReviews].map((review, index) => (
              <article className="club-detail__comment" key={review.id}>
                <span className={`club-detail__avatar${index === 1 ? " club-detail__avatar--gold" : ""}`} aria-hidden="true"><CircleUserRound size={21} /></span>
                <div>
                  <div className="club-detail__review-meta">
                    <b>Anonymous</b>
                    {"commitment" in review ? (
                      <>
                        <span>{commitmentLabels[review.commitment - 1]} commitment</span>
                        <span aria-label={`${review.enjoyment} out of 4 stars`}>{"★".repeat(review.enjoyment)}</span>
                      </>
                    ) : <span>{review.schoolYear}</span>}
                    <time dateTime={review.dateTime}>{review.date}</time>
                  </div>
                  <p>{review.body}</p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>

      {reviewOpen && (
        <div className="review-dialog-backdrop" role="presentation" onMouseDown={closeReviewDialog}>
          <section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="review-title">Review {clubName}</h2>
            <label>Weekly commitment <b>{commitmentLabels[commitment - 1]}</b><input type="range" min="1" max="5" value={commitment} onChange={(event) => setCommitment(Number(event.target.value))} /></label>
            <fieldset><legend>How much did you enjoy it?</legend><div className="review-dialog__stars">{[1, 2, 3, 4].map((rating) => <button type="button" key={rating} aria-label={`${rating} stars`} onClick={() => setEnjoyment(rating)}><Star fill={rating <= enjoyment ? "currentColor" : "none"} /></button>)}</div></fieldset>
            <label>Leave a note<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What should other students know?" /></label>
            {reviewError && <p role="alert">{reviewError}</p>}
            <div className="review-dialog__actions"><button type="button" onClick={closeReviewDialog}>Cancel</button><button type="button" className="review-dialog__submit" onClick={submitReview}>Post review</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
