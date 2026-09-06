import { useEffect, useState } from "react";
import {
  CircleUserRound,
  ExternalLink,
  Globe2,
  MessageCircle,
  Plus,
} from "lucide-react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { SiGroupme } from "react-icons/si";
import type { Club } from "../clubview/ClubListingsPage";
import { supabase } from "../../utils/supabase";
import { RatingStars } from "../RatingStars/RatingStars";
import { starsToStoredRating, storedRatingToStars } from "../../utils/ratings";
import "./ClubDetail.css";

type ClubDetailProps = {
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
  commitment: number | null;
};

const commitmentOptions = [
  {
    value: 1,
    label: "No commitment",
    detail: "Drop in whenever you want",
    tone: "none",
  },
  {
    value: 2,
    label: "Low commitment",
    detail: "Events every once in a while",
    tone: "low",
  },
  {
    value: 3,
    label: "Moderate commitment",
    detail: "A few hours each week",
    tone: "moderate",
  },
  {
    value: 4,
    label: "High commitment",
    detail: "3–5 hours each week",
    tone: "high",
  },
  {
    value: 5,
    label: "Serious commitment",
    detail: "6+ hours each week",
    tone: "serious",
  },
] as const;

const commitmentLabel = (value: number | null) =>
  commitmentOptions.find((option) => option.value === value)?.label ??
  "Unknown commitment";

const commitmentTone = (average: number) =>
  commitmentOptions[Math.max(0, Math.min(4, Math.round(average) - 1))].tone;

export function ClubDetail({ club }: ClubDetailProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [commitment, setCommitment] = useState(3);
  const [enjoyment, setEnjoyment] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState(false);
  const [isPostingReview, setIsPostingReview] = useState(false);
  const clubName = club?.name ?? "Cal Poly Robotics";
  const clubDescription =
    club?.description ??
    "A hands-on community for students who want to design, build, and compete with robots together.";
  const clubTags = club?.tags ?? ["Engineering", "Robotics", "Build teams"];
  const clubInitials =
    club?.initials ??
    clubName
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 4);
  const commitmentLevel = club?.commitment ?? "moderate";
  const commitmentInfo = commitmentDetails[commitmentLevel];
  const contactLinks = club?.contactLinks ?? [];
  const communityRating =
    reviewList.length > 0
      ? reviewList.reduce((total, review) => total + review.rating, 0) /
        reviewList.length
      : undefined;
  const communityRatingLabel =
    communityRating === undefined
      ? "No enjoyment rating yet"
      : `${communityRating.toFixed(1)} out of 4 stars`;
  const validCommitments = reviewList
    .map((review) => review.commitment)
    .filter(
      (value): value is number =>
        value !== null && Number.isInteger(value) && value >= 1 && value <= 5,
    );
  const communityCommitment =
    validCommitments.length > 0
      ? validCommitments.reduce((total, value) => total + value, 0) /
        validCommitments.length
      : undefined;
  const communityCommitmentLevel =
    communityCommitment === undefined
      ? undefined
      : commitmentTone(communityCommitment);
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
      setReviewList(
        (data ?? []).flatMap((row) => {
          const rating = storedRatingToStars(row.rating);
          const reviewCommitment = Number(row.commitment);
          if (rating === null) return [];
          const commitmentValue =
            Number.isInteger(reviewCommitment) &&
            reviewCommitment >= 1 &&
            reviewCommitment <= 5
              ? reviewCommitment
              : null;
          return [{ ...row, rating, commitment: commitmentValue } as Review];
        }),
      );
    }

    void loadReviews();
    return () => {
      active = false;
    };
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
    let note = comment.trim();

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
      if (note) note = "-";
      return;
    }

    const storedRating = starsToStoredRating(enjoyment);
    if (storedRating === null) {
      setReviewError("Choose a rating from 0.5 to 4 stars.");
      return;
    }

    const newReviewData = {
      name: "Anonymous",
      rating: storedRating,
      review: note,
      club_id: clubId,
      commitment,
    };

    setNewReview(true);
    setIsPostingReview(true);
    setReviewError(null);

    const { data, error } = await supabase
      .from("ratings")
      .insert(newReviewData)
      .select("id, created_at, name, rating, review, club_id, commitment")
      .single();

    setIsPostingReview(false);
    setNewReview(false);

    if (error) {
      setReviewError(error.message);
      return;
    }

    const returnedRating = storedRatingToStars(data.rating);
    if (returnedRating === null) {
      setReviewError("The submitted rating was invalid.");
      return;
    }
    setReviewList((previousReviews) => [
      { ...data, rating: returnedRating, commitment } as Review,
      ...previousReviews,
    ]);
    closeReviewDialog();
  }

  return (
    <main className="club-detail">
      <div className="club-detail__content">
        <section className="club-detail__hero" aria-labelledby="club-title">
          <div className="club-detail__mark">
            {club?.logoUrl ? (
              <img
                src={club.logoUrl}
                alt={club.logoAlt ?? `${clubName} logo`}
              />
            ) : (
              <span aria-hidden="true">{clubInitials}</span>
            )}
          </div>
          <div className="club-detail__headline">
            <h1 id="club-title">{clubName}</h1>
            <div className="club-detail__tags" aria-label="Club tags">
              {clubTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
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
            {contactLinks.length > 0 && (
              <aside className="detail-card club-detail__contact">
                <h2>Connect with the club</h2>
                <div className="club-detail__contact-icons">
                  {contactLinks.map((contact, index) => {
                    const Icon = contactIcons[contact.platform];
                    return (
                      <a
                        key={`${contact.platform}-${contact.url}-${index}`}
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

            <section className="detail-card club-detail__official">
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
              <div className="club-detail__commitment-summary">
                <span
                  className={`club-detail__commitment-dot club-detail__commitment-dot--${commitmentLevel}`}
                  aria-hidden="true"
                />
                <div>
                  <b>{commitmentInfo.label}</b>
                  <p>{commitmentInfo.detail}</p>
                </div>
              </div>
            </section>

            <section
              className="detail-card club-detail__community"
              aria-label="Community details"
            >
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
                  <div className="club-detail__rating-value">
                    <RatingStars
                      value={communityRating ?? 0}
                      label={communityRatingLabel}
                      className="club-detail__community-rating"
                    />
                    <span>
                      {communityRating === undefined
                        ? "Not rated yet"
                        : `${communityRating.toFixed(1)} / 4`}
                    </span>
                  </div>
                </div>
                <div className="club-detail__community-metric">
                  <b>Commitment</b>
                  {communityCommitment !== undefined &&
                  communityCommitmentLevel ? (
                    <div
                      className="club-detail__community-commitment"
                      aria-label={`Average community commitment: ${communityCommitment.toFixed(1)} out of 5, ${commitmentLabel(Math.round(communityCommitment))}`}
                    >
                      <span
                        className={`club-detail__commitment-dot club-detail__commitment-dot--${communityCommitmentLevel}`}
                        aria-hidden="true"
                      />
                      <span>
                        {commitmentLabel(Math.round(communityCommitment))}
                      </span>
                    </div>
                  ) : (
                    <span className="club-detail__community-commitment">
                      No community commitment yet
                    </span>
                  )}
                </div>
              </div>
            </section>
          </div>

          <section className="detail-card club-detail__comments">
            <div className="detail-card__heading">
              <div>
                <h2>Reviews</h2>
              </div>
              <MessageCircle size={21} aria-hidden="true" />
            </div>
            {reviewList.length === 0 ? (
              <p className="club-detail__no-reviews">
                No reviews yet. Be the first to share your experience.
              </p>
            ) : (
              reviewList.map((review, index) => (
                <article className="club-detail__comment" key={review.id}>
                  <span
                    className={`club-detail__avatar${index % 2 ? " club-detail__avatar--gold" : ""}`}
                    aria-hidden="true"
                  >
                    <CircleUserRound size={21} />
                  </span>
                  <div>
                    <div className="club-detail__review-meta">
                      <b>{review.name?.trim() || "Anonymous"}</b>
                      <span>{commitmentLabel(review.commitment)}</span>
                      <RatingStars
                        value={review.rating}
                        size={16}
                        label={`${review.rating} out of 4 stars`}
                        className="club-detail__review-rating"
                      />
                      <time dateTime={review.created_at}>
                        {new Date(review.created_at).toLocaleDateString(
                          undefined,
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </time>
                    </div>
                    {review.review && <p>{review.review}</p>}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>

      {reviewOpen && (
        <div
          className="review-dialog-backdrop"
          role="presentation"
          onMouseDown={closeReviewDialog}
        >
          <section
            className="review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="review-title">Review {clubName}</h2>
            <fieldset className="review-dialog__commitment">
              <legend>Weekly commitment<br/></legend>
              <div
                className="review-dialog__commitment-options"
                role="radiogroup"
                aria-label="Weekly commitment"
              >
                {commitmentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={commitment === option.value}
                    className={`review-dialog__commitment-option review-dialog__commitment-option--${option.tone}${commitment === option.value ? " is-selected" : ""}`}
                    disabled={isPostingReview}
                    onClick={() => setCommitment(option.value)}
                  >
                    <span
                      className="review-dialog__commitment-dot"
                      aria-hidden="true"
                    />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>How much did you enjoy it?</legend>
              <RatingStars
                value={enjoyment}
                size={28}
                onChange={setEnjoyment}
                label="Enjoyment rating"
                disabled={isPostingReview}
                className="review-dialog__stars"
              />
            </fieldset>
            <label>
              Leave a note
              <textarea
                value={comment}
                disabled={isPostingReview}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What should other students know?"
              />
            </label>
            {reviewError && <p role="alert">{reviewError}</p>}
            <div className="review-dialog__actions">
              <button
                type="button"
                disabled={isPostingReview}
                onClick={closeReviewDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="review-dialog__submit"
                disabled={isPostingReview}
                onClick={() => void addReview()}
              >
                {isPostingReview ? "Posting…" : "Post review"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
