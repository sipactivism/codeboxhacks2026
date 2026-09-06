import { useContext, useRef, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Globe2,
  Plus,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import "/src/components/createpage/createpagestyle.css";
import { PageContext } from "../../PageContext";
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
  ["sport", "Sport", "This club is a sport"],
  ["culture", "Culture", "This is a culture club"],
  ["art", "Art", "Any kind of art"],
  ["academic", "Academic", "Has to do with a major or academics"],
  ["fun", "Fun", "EX: Hummus Club"],
  ["other", "Other", "None of the previous options"],
] as const;

const CLUB_IMAGES_BUCKET = "club_icons";

function CreatePage() {
  const pageContext = useContext(PageContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["Technology"]);
  const [tagText, setTagText] = useState("");
  const [majors, setMajors] = useState<string[]>([]);
  const [majorOpen, setMajorOpen] = useState(false);
  const [commitment, setCommitment] = useState(2);
  const [clubType, setClubType] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactLinks, setContactLinks] = useState({
    instagram: "",
    discord: "",
    groupme: "",
    website: "",
  });

  const addTag = () => {
    const value = tagText.trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setTagText("");
  };

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

      //TODO SEND THE USER TO THE CLUB PAGE FOR THAT CLUB
      //TODO SEND THE USER TO THE CLUB PAGE FOR THAT CLUB
      //TODO SEND THE USER TO THE CLUB PAGE FOR THAT CLUB
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
        contact_links: Object.entries(contactLinks)
          .filter(([, value]) => value.trim())
          .map(([platform, url]) => ({ platform, url })),
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setCreated(true);
  };

  return (
    <main>
      <section className="page-head">
        <button className="back" onClick={() => pageContext.setPageNum(1)}>
          <ArrowLeft size={18} /> Back to dashboard
        </button>
        <div>
          <p className="eyebrow"></p>
          <h1>Add your club</h1>
          <p className="subtitle">
            Add your club to ClubRate so that others can see and rate it.
          </p>
        </div>
      </section>
      <section className="layout">
        <div className="form-card">
          <div className="section-title">
            <span className="step">01</span>
            <div>
              <h2>Basic information</h2>
              <p>Details such as name, image, and club description.</p>
            </div>
          </div>
          <div className="profile-row">
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
            <div>
              <label>Club image</label>
              <p className="muted">
                Upload an image for your club for others to view at a glance.
              </p>
              <button
                className="upload"
                onClick={() => inputRef.current?.click()}
              >
                <Camera size={16} /> Upload image
              </button>
            </div>
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
              Short description <i>Required</i>
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is your club all about? Keep it welcoming, clear, and specific."
              maxLength={2000}
            />
            <span className="count">{description.length} / 2000</span>
          </div>
          <div className="field">
            <label>
              Tags <span className="optional">Optional</span>
            </label>
            <p className="hint">
              Help students find you. Add topics, interests, or disciplines.
            </p>
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
              <button className="add" onClick={addTag}>
                <Plus size={17} />
              </button>
            </div>
          </div>
          <div className="field">
            <label>
              Targeted majors <span className="optional">Optional</span>
            </label>
            <p className="hint">
              Select any majors your club is especially relevant to.
            </p>
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
            <span className="step">02</span>
            <div>
              <h2>What’s the commitment?</h2>
              <p>Set expectations so students know what to expect.</p>
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
            <input
              aria-label="Commitment level"
              type="range"
              min="0"
              max="4"
              step="0.01"
              value={commitment}
              onChange={(event) =>
                setCommitment(Math.round(+event.target.value))
              }
            />
            <div className="range-label">
              <b>{spectrum[commitment][0]}</b>
              <span>{spectrum[commitment][1]}</span>
            </div>
          </div>
          <div className="section-title lower">
            <span className="step">04</span>
            <div>
              <h2>Select the type of club</h2>
              <p>Do any of these apply to your club?</p>
              <br/>
            </div>
          </div>
          <div
            className="club-types"
            role="radiogroup"
            aria-label="Club type"
            style={{ display: "flex", flexWrap: "nowrap", gap: "10px" }}
          >
            {clubTypes.map(([value, label, description]) => (
              <button
                className="upload"
                type="button"
                role="radio"
                aria-checked={clubType === value}
                aria-label={`${label}: ${description}`}
                key={value}
                onClick={() => setClubType(value)}
                style={
                  clubType === value
                    ? { borderColor: "#2e6244", background: "#edf5ec", boxShadow: "0 0 0 3px #cfe3d1" }
                    : undefined
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="section-title lower">
            <span className="step">05</span>
            <div>
              <h2>Ways to connect</h2>
              <p>Add any links you’d like students to use.</p>
            </div>
          </div>
          <div className="contacts">
            <div className="contact">
              <AtSign size={18} />
              <input
                value={contactLinks.instagram}
                onChange={(event) =>
                  setContactLinks({
                    ...contactLinks,
                    instagram: event.target.value,
                  })
                }
                placeholder="Instagram handle or link"
              />
            </div>
            <div className="contact">
              <Users size={18} />
              <input
                value={contactLinks.discord}
                onChange={(event) =>
                  setContactLinks({
                    ...contactLinks,
                    discord: event.target.value,
                  })
                }
                placeholder="Discord invite link"
              />
            </div>
            <div className="contact">
              <CircleHelp size={18} />
              <input
                value={contactLinks.groupme}
                onChange={(event) =>
                  setContactLinks({
                    ...contactLinks,
                    groupme: event.target.value,
                  })
                }
                placeholder="GroupMe link"
              />
            </div>
            <div className="contact">
              <Globe2 size={18} />
              <input
                value={contactLinks.website}
                onChange={(event) =>
                  setContactLinks({
                    ...contactLinks,
                    website: event.target.value,
                  })
                }
                placeholder="Club website"
              />
            </div>
          </div>
          <div className="actions">
            <p>
              <ShieldCheck size={17} /> You can edit these details anytime.
            </p>
            <div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <button
              className="create"
              disabled={submitting || created}
              onClick={createClub}
            >
              {created ? (
                <>
                  <Check size={18} /> Club created!
                </>
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
