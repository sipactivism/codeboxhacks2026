import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  Globe2,
  Plus,
  X,
} from "lucide-react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { SiGroupme } from "react-icons/si";
import "/src/components/createpage/createpagestyle.css";
import { majorGroups } from "../../data/majors";
import { supabase } from "../../utils/supabase";

const spectrum = [
  ["No commitment", "Drop in whenever you want", "mint"],
  ["Low commitment", "Events every once in a while", "yellow"],
  ["Moderate commitment", "A few hours each week", "peach"],
  ["High commitment", "3–5 hours each week", "rose"],
  ["Serious commitment", "6+ hours each week", "coral"],
];

const clubTypes = [
  ["sport", "Sport"],
  ["culture", "Culture"],
  ["art", "Art"],
  ["academic", "Academic"],
  ["fun", "Fun"],
  ["other", "Other"],
] as const;

type ContactPlatform = "discord" | "groupme" | "instagram" | "website";
type ContactRow = { id: string; platform: ContactPlatform; value: string };

const contactOptions: Array<{ value: ContactPlatform; label: string }> = [
  { value: "discord", label: "Discord" },
  { value: "groupme", label: "GroupMe" },
  { value: "instagram", label: "Instagram" },
  { value: "website", label: "Website" },
];

function createContactRow(platform: ContactPlatform): ContactRow {
  return {
    id: crypto.randomUUID(),
    platform,
    value: "",
  };
}

function ContactIcon({ platform }: { platform: ContactPlatform }) {
  if (platform === "discord") return <FaDiscord aria-hidden="true" />;
  if (platform === "groupme") return <SiGroupme aria-hidden="true" />;
  if (platform === "instagram") return <FaInstagram aria-hidden="true" />;
  return <Globe2 aria-hidden="true" height={12} width={12} />;
}

const CLUB_IMAGES_BUCKET = "club_icons";
const DEFAULT_TAG_OPTIONS = [
  "Academic",
  "Arts",
  "Business",
  "Community service",
  "Culture",
  "Dance",
  "Engineering",
  "Environmental",
  "Food",
  "Gaming",
  "Health",
  "Music",
  "Outdoors",
  "Professional",
  "Recreation",
  "Social",
  "Sports",
  "Technology",
  "Theater",
  "Volunteer",
];

function CreatePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["Technology"]);
  const [tagText, setTagText] = useState("");
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState(DEFAULT_TAG_OPTIONS);
  const [majors, setMajors] = useState<string[]>([]);
  const [majorOpen, setMajorOpen] = useState(false);
  const [commitment, setCommitment] = useState(2);
  const [clubType, setClubType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactLinks, setContactLinks] = useState<ContactRow[]>([]);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);

  const addTag = () => {
    const value = tagText.trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setTagText("");
  };

  const addAvailableTag = (tag: string) => {
    setTags((currentTags) => currentTags.includes(tag) ? currentTags : [...currentTags, tag]);
    setTagMenuOpen(false);
  };

  useEffect(() => {
    let active = true;

    async function loadAvailableTags() {
      const { data, error } = await supabase
        .schema("public")
        .from("clubs")
        .select("tags")
        .eq("approved", true);

      if (!active || error) return;

      const tagsFromClubs = (data ?? []).flatMap((club) =>
        Array.isArray(club.tags) ? club.tags.filter((tag): tag is string => typeof tag === "string") : [],
      );
      setAvailableTags([...new Set([...DEFAULT_TAG_OPTIONS, ...tagsFromClubs])].sort((a, b) => a.localeCompare(b)));
    }

    void loadAvailableTags();
    return () => { active = false; };
  }, []);

  const createClub = async () => {
    const name = clubName.trim();
    const clubDescription = description.trim();

    if (!name || !clubDescription) {
      setError("Enter a club name and short description before creating it.");
      return;
    }

    if (!clubType) {
      setError("Select a type for your club before creating it.");
      return;
    }

    const typeTag = `#${clubType}`;
    const clubTags = tags.includes(typeTag) ? tags : [...tags, typeTag];

    setSubmitting(true);
    setError(null);

    let imageUrl: string | null = null;

    if (imageFile) {
      const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `clubs/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(CLUB_IMAGES_BUCKET)
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        setSubmitting(false);
        setError(`Could not upload the club image: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage
        .from(CLUB_IMAGES_BUCKET)
        .getPublicUrl(filePath);
      imageUrl = data.publicUrl;

    }

    const { error: insertError } = await supabase
      .schema("public")
      .from("clubs")
      .insert({
        name,
        description: clubDescription,
        approved: false,
        image: imageUrl,
        club_statistics: {
          commitment_level: spectrum[commitment][0],
          majors: majors,
        },
        club_info_last_updated: new Date().toISOString(),
        meeting_info: [],
        tags: clubTags,
        contact_links: contactLinks
          .filter(({ value }) => value.trim())
          .map(({ platform, value }) => ({ platform, url: value.trim() })),
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSubmitted(true);
  };

  return (
    <main>
      <section className="page-head">
        <div>
          <h1>Add your club</h1>
        </div>
      </section>
      <section className="layout">
        <div className="form-card">
          <div className="section-title">
            <div>
              <h2>Basic information</h2>
            </div>
          </div>
          <div className="profile-row">
            <div>
              <label>Club image</label>
            </div>
            <button
              className={"photo " + (!image ? "empty" : "")}
              onClick={() => inputRef.current?.click()}
            >
              {image ? (
                <span
                  className="photo-image"
                  style={{ backgroundImage: `url(${image})` }}
                />
              ) : (
                <>
                  <Camera size={24} />
                  <b>Add photo</b>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              className="sr"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImage(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          <div className="field">
            <label>
              Club name <i>Required</i>
            </label>
            <input
              value={clubName}
              onChange={(event) => setClubName(event.target.value)}
              placeholder="e.g. Cal Poly Robotics"
            />
          </div>
          <div className="field">
            <label>
              Short description <i>*</i>
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter a short description"
              maxLength={2000}
            />
            <span className="count">{description.length} / 2000</span>
          </div>
          <div className="field">
            <label>
              Tags <span className="optional">Optional</span>
            </label>
            <div className="tag-picker">
              <div className="tagbox">
                {tags.map((tag) => (
                  <button className="tag" key={tag}>
                    {tag}
                    <X
                      size={14}
                      onClick={() => setTags(tags.filter((item) => item !== tag))}
                    />
                  </button>
                ))}
                <input
                  key="tag-input"
                  value={tagText}
                  onChange={(event) => setTagText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }

                    if (
                      event.key === "Backspace" &&
                      tagText === "" &&
                      tags.length > 0
                    ) {
                      event.preventDefault();
                      setTags((currentTags) => currentTags.slice(0, -1));
                    }
                  }}
                  placeholder="Add a tag"
                />
                <button
                  className="add"
                  type="button"
                  aria-label="Choose from available tags"
                  aria-haspopup="listbox"
                  aria-expanded={tagMenuOpen}
                  onClick={() => setTagMenuOpen((open) => !open)}
                >
                  <Plus size={17} />
                </button>
              </div>
              {tagMenuOpen && (
                <div className="tag-menu" role="listbox" aria-label="Available tags">
                  {availableTags.map((tag) => (
                    <button
                      type="button"
                      role="option"
                      key={tag}
                      aria-selected={tags.includes(tag)}
                      disabled={tags.includes(tag)}
                      onClick={() => addAvailableTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="field">
            <label>
              Targeted majors <span className="optional">Optional</span>
            </label>
            <button className="select" onClick={() => setMajorOpen(!majorOpen)}>
              {majors.length
                ? `${majors.length} major${majors.length > 1 ? "s" : ""} selected`
                : "Choose majors"}
              <ChevronDown size={18} />
            </button>
            {majorOpen && (
              <div className="major-menu">
                {Object.entries(majorGroups).map(([group, list]) => (
                  <div key={group}>
                    <strong>{group}</strong>
                    {list.map((major) => (
                      <label className="check" key={major}>
                        <input
                          type="checkbox"
                          checked={majors.includes(major)}
                          onChange={() =>
                            setMajors(
                              majors.includes(major)
                                ? majors.filter((item) => item !== major)
                                : [...majors, major],
                            )
                          }
                        />
                        <span>{major}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {majors.length > 0 && (
              <div className="chosen">
                {majors.map((major) => (
                  <button className="tag" key={major}>
                    {major}
                    <X
                      size={14}
                      onClick={() =>
                        setMajors(majors.filter((item) => item !== major))
                      }
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="section-title lower">
            <div>
              <h2>What’s the commitment?</h2>
            </div>
          </div>
          <div className="commitment">
            <div className="spectrum">
              {spectrum.map(([name, description, color], index) => (
                <button
                  key={name}
                  onClick={() => setCommitment(index)}
                  className={
                    "spectrum-card " +
                    color +
                    (commitment === index ? " chosen-card" : "")
                  }
                >
                  <span className="radio">
                    {commitment === index && <Check size={13} />}
                  </span>
                  <b>{name}</b>
                  <small>{description}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="section-title lower">
            <div>
              <h2>Select the type of club</h2>
            </div>
          </div>
          <div
            className="club-types"
            role="radiogroup"
            aria-label="Club type"
          >
            {clubTypes.map(([value, label]) => (
              <button
                className={`club-type${clubType === value ? " club-type--selected" : ""}`}
                type="button"
                role="radio"
                aria-checked={clubType === value}
                aria-label={label}
                key={value}
                onClick={() => setClubType(value)}
              >
                <strong>{label}</strong>
                <span className="club-type__radio">
                  {clubType === value && <Check size={13} />}
                </span>
              </button>
            ))}
          </div>
          <div className="section-title lower">
            <span className="step">04</span>
            <div>
              <h2>Ways to connect</h2>
            </div>
          </div>
          <div className="contacts" aria-label="Club contact links">
            {contactLinks.map((contact) => {
              const platformLabel = contactOptions.find((option) => option.value === contact.platform)?.label ?? "Contact";
              return (
                <div className="contact" key={contact.id}>
                  <ContactIcon platform={contact.platform} />
                  <label className="sr-only" htmlFor={`contact-${contact.id}`}>
                    {platformLabel} link or handle
                  </label>
                  <input
                    id={`contact-${contact.id}`}
                    type={contact.platform === "website" ? "url" : "text"}
                    value={contact.value}
                    onChange={(event) =>
                      setContactLinks((current) => current.map((item) =>
                        item.id === contact.id ? { ...item, value: event.target.value } : item,
                      ))
                    }
                    placeholder={contact.platform === "website" ? "Website URL" : `${platformLabel} link or handle`}
                  />
                  <button
                    type="button"
                    className="contact-remove"
                    aria-label={`Remove ${platformLabel} contact`}
                    onClick={() => setContactLinks((current) => current.filter((item) => item.id !== contact.id))}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
            <div className="contact-add">
              <button
                type="button"
                className="add contact-add-button"
                aria-label="Add a contact link"
                aria-haspopup="menu"
                aria-expanded={contactMenuOpen}
                onClick={() => setContactMenuOpen((open) => !open)}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
              {contactMenuOpen && (
                <div className="contact-menu" role="menu" aria-label="Choose a contact platform">
                  {contactOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setContactLinks((current) => [...current, createContactRow(option.value)]);
                        setContactMenuOpen(false);
                      }}
                    >
                      <ContactIcon platform={option.value} />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="actions">
            <div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              {submitted && (
                <p className="form-success" role="status">
                  Club submitted for approval. It will appear in ClubRate once approved.
                </p>
              )}
            </div>
            <button
              className="create"
              disabled={submitting || submitted}
              onClick={createClub}
            >
              {submitted ? (
                <><Check size={18} /> Submitted for approval</>
              ) : submitting ? (
                "Creating club…"
              ) : (
                "Create club"
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CreatePage;
