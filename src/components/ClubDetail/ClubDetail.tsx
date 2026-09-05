import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  Plus,
  Star,
  Users,
} from "lucide-react";

import "./ClubDetail.css";

type ClubDetailProps = {
  onBack: () => void;
};

const contacts = [
  { label: "Instagram", handle: "@calpolyrobotics", href: "https://instagram.com" },
  { label: "Discord", handle: "Join the server", href: "https://discord.com" },
  { label: "Website", handle: "clubrobotics.org", href: "https://example.com" },
];

export function ClubDetail({ onBack }: ClubDetailProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [commitment, setCommitment] = useState(3);
  const [enjoyment, setEnjoyment] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <main className="club-detail">
      <div className="club-detail__content">
        <button className="club-detail__back" type="button" onClick={onBack}>
          <ArrowLeft size={17} /> Back to clubs
        </button>

        <section className="club-detail__hero" aria-labelledby="club-title">
          <div className="club-detail__mark" aria-hidden="true">CR</div>
          <div className="club-detail__headline">
            <div className="club-detail__eyebrow">ENGINEERING · ACTIVE CLUB</div>
            <h1 id="club-title">Cal Poly Robotics</h1>
            <p>
              A hands-on community for students who want to design, build, and
              compete with robots together.
            </p>
            <div className="club-detail__tags" aria-label="Club tags">
              <span>Engineering</span><span>Robotics</span><span>Build teams</span>
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
          <section className="detail-card club-detail__about">
            <div className="detail-card__heading">
              <div>
                <p className="section-kicker">AT A GLANCE</p>
                <h2>Club details</h2>
              </div>
              <span className="club-detail__updated">Updated this month</span>
            </div>
            <div className="club-detail__facts">
              <div><MapPin size={18} /><span><b>Meeting room</b>14-0233</span></div>
              <div><CalendarDays size={18} /><span><b>Established</b>Fall 2016</span></div>
              <div><Users size={18} /><span><b>Open to</b>All majors</span></div>
              <div><Clock3 size={18} /><span><b>Meets</b>Thursdays at 6 PM</span></div>
            </div>
          </section>

          <aside className="detail-card club-detail__ratings" aria-label="Club ratings">
            <p className="section-kicker">STUDENT RATINGS</p>
            <div className="club-detail__score"><strong>4.7</strong><span><Star size={15} fill="currentColor" /> 42 reviews</span></div>
            <div className="club-detail__meter"><span>Commitment</span><div><i style={{ width: "62%" }} /></div><b>Moderate</b></div>
            <div className="club-detail__meter"><span>Enjoyment</span><div><i style={{ width: "94%" }} /></div><b>Excellent</b></div>
          </aside>

          <section className="detail-card club-detail__comments">
            <div className="detail-card__heading">
              <div><p className="section-kicker">COMMUNITY NOTES</p><h2>What members say</h2></div>
              <MessageCircle size={21} aria-hidden="true" />
            </div>
            <article className="club-detail__comment">
              <span className="club-detail__avatar">JM</span>
              <div><div><b>Jordan M.</b><small> · Computer Science, ‘27</small></div><p>Everyone is willing to teach. I joined without experience and had a project to show off by the end of the quarter.</p></div>
            </article>
            <article className="club-detail__comment">
              <span className="club-detail__avatar club-detail__avatar--gold">AC</span>
              <div><div><b>Avery C.</b><small> · Mechanical Engineering, ‘26</small></div><p>A great balance of build nights, competition prep, and a genuinely fun group of people.</p></div>
            </article>
          </section>

          <aside className="detail-card club-detail__contact">
            <p className="section-kicker">STAY CONNECTED</p>
            <h2>Contact the club</h2>
            <div>
              {contacts.map((contact) => <a key={contact.label} href={contact.href} target="_blank" rel="noreferrer"><span>{contact.label}<small>{contact.handle}</small></span><ExternalLink size={16} /></a>)}
            </div>
          </aside>
        </div>
      </div>

      {reviewOpen && (
        <div className="review-dialog-backdrop" role="presentation" onMouseDown={() => setReviewOpen(false)}>
          <section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title" onMouseDown={(event) => event.stopPropagation()}>
            <p className="section-kicker">YOUR EXPERIENCE</p>
            <h2 id="review-title">Review Cal Poly Robotics</h2>
            <label>Weekly commitment <b>{["Low", "Light", "Moderate", "High", "Serious"][commitment - 1]}</b><input type="range" min="1" max="5" value={commitment} onChange={(event) => setCommitment(Number(event.target.value))} /></label>
            <fieldset><legend>How much did you enjoy it?</legend><div className="review-dialog__stars">{[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} aria-label={`${rating} stars`} onClick={() => setEnjoyment(rating)}><Star fill={rating <= enjoyment ? "currentColor" : "none"} /></button>)}</div></fieldset>
            <label>Leave a note<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What should other students know?" /></label>
            <div className="review-dialog__actions"><button type="button" onClick={() => setReviewOpen(false)}>Cancel</button><button type="button" className="review-dialog__submit" onClick={() => setReviewOpen(false)}>Post review</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
