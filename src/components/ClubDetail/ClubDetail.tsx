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
import { supabase } from "../../utils/supabase";
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

type Review = {
  id: number;
  created_at: string;
  name: string | null;
  rating: number;
  review: string | null;
  club_id: number;
  commitment: number;
};

type NewReview = Omit<Review, "id" | "created_at">;

const commitmentLabels = ["Low", "Light", "Moderate", "High", "Serious"];

export function ClubDetail({ onBack, club }: ClubDetailProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [commitment, setCommitment] = useState(3);
  const [enjoyment, setEnjoyment] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<NewReview | "">("");
  const [isPostingReview, setIsPostingReview] = useState(false);
  const clubName = club?.name ?? "Cal Poly Robotics";
  const clubDescription = club?.description ?? "A hands-on community for students who want to design, build, and compete with robots together.";
  const clubTags = club?.tags ?? ["Engineering", "Robotics", "Build teams"];
  const clubInitials = club?.initials ?? clubName.split(/\s+/).map((word) => word[0]).join("").slice(0, 4);
  const commitmentLevel = club?.commitment ?? "moderate";
  const commitmentInfo = commitmentDetails[commitmentLevel];
  const contactLinks = club?.contactLinks ?? [];
  const parsedClubId = Number(club?.id);
  const clubId = Number.isInteger(parsedClubId) ? parsedClubId : null;

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      if (clubId === null) {
        setReviewList([]);
        return;
      }

      const { data, error } = await supabase
        .from("ratings")
        .select("id, created_at, name, rating, review, club_id, commitment")
        .eq("club_id", clubId)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setReviewError("Reviews could not be loaded right now.");
        return;
      }
      setReviewList((data ?? []) as Review[]);
    }

    void loadReviews();
    return () => { active = false; };
  }, [clubId]);

  function closeReviewDialog() {
    setReviewOpen(false);
    setReviewError(null);
    setCommitment(3);
    setEnjoyment(0);
    setComment("");
  }

  function openNewReviewDialog() {
    closeReviewDialog();
    setReviewOpen(true);
  }

  async function addReview() {
    const note = comment.trim();

    if (newReview || isPostingReview) return;
    if (clubId === null) {
      setReviewError("Choose a club before posting a review.");
      return;
    }
    if (enjoyment === 0) {
      setReviewError("Choose a star rating before posting your review.");
      return;
    }

    if (!note) {
      setReviewError("Write a short note before posting your review.");
      return;
    }

    const newReviewData: NewReview = {
      name: "Anonymous",
      rating: enjoyment,
      review: note,
      club_id: clubId,
      commitment,
    };

    setNewReview(newReviewData);
    setIsPostingReview(true);
    setReviewError(null);

    const { data, error } = await supabase
      .from("ratings")
      .insert(newReviewData)
      .select("id, created_at, name, rating, review, club_id, commitment")
      .single();

    setIsPostingReview(false);
    setNewReview("");

    if (error) {
      setReviewError(error.message);
      return;
    }

    setReviewList((previousReviews) => [data as Review, ...previousReviews]);
    closeReviewDialog();
  }

  return (
    <main className="club-detail">
      <div className="club-detail__content">
        <button className="club-detail__back" type="button" onClick={onBack}>
          <ArrowLeft size={17} /> Back to clubs
        </button>

        <section className="club-detail__hero" aria-labelledby="club-title">
          <div className="club-detail__mark">
            {club?.logoUrl ? (
              <img src={club.logoUrl} alt={club.logoAlt ?? `${clubName} logo`} />
            ) : (
              <span aria-hidden="true">{clubInitials}</span>
            )}
          </div>
          <div className="club-detail__headline">
            <h1 id="club-title">{clubName}</h1>
            <div className="club-detail__tags" aria-label="Club tags">
              {clubTags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
          <button
            className="club-detail__review-button"
            type="button"
            onClick={openNewReviewDialog}
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
            {reviewList.length === 0 ? (
              <p className="club-detail__no-reviews">No reviews yet. Be the first to share your experience.</p>
            ) : reviewList.map((review, index) => (
              <article className="club-detail__comment" key={review.id}>
                <span className={`club-detail__avatar${index % 2 ? " club-detail__avatar--gold" : ""}`} aria-hidden="true"><CircleUserRound size={21} /></span>
                <div>
                  <div className="club-detail__review-meta">
                    <b>{review.name?.trim() || "Anonymous"}</b>
                    <span>{commitmentLabels[review.commitment - 1]} commitment</span>
                    <span aria-label={`${review.rating} out of 4 stars`}>{"★".repeat(review.rating)}</span>
                    <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</time>
                  </div>
                  {review.review && <p>{review.review}</p>}
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
            <label>Weekly commitment <b>{commitmentLabels[commitment - 1]}</b><input type="range" min="1" max="5" value={commitment} disabled={isPostingReview} onChange={(event) => setCommitment(Number(event.target.value))} /></label>
            <fieldset><legend>How much did you enjoy it?</legend><div className="review-dialog__stars">{[1, 2, 3, 4].map((rating) => <button type="button" key={rating} aria-label={`${rating} stars`} disabled={isPostingReview} onClick={() => setEnjoyment(rating)}><Star fill={rating <= enjoyment ? "currentColor" : "none"} /></button>)}</div></fieldset>
            <label>Leave a note<textarea value={comment} disabled={isPostingReview} onChange={(event) => setComment(event.target.value)} placeholder="What should other students know?" /></label>
            {reviewError && <p role="alert">{reviewError}</p>}
            <div className="review-dialog__actions"><button type="button" disabled={isPostingReview} onClick={closeReviewDialog}>Cancel</button><button type="button" className="review-dialog__submit" disabled={isPostingReview} onClick={() => void addReview()}>{isPostingReview ? "Posting…" : "Post review"}</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
