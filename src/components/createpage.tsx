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
import "../styles/createpage.css";
import { PageContext } from "../PageContext";
import { supabase } from "../utils/supabase";

const majorGroups = {
  Engineering: [
    "Aerospace Engineering",
    "Architectural Engineering",
    "Biomedical Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Computer Science",
    "Electrical Engineering",
    "Environmental Engineering",
    "General Engineering",
    "Industrial Engineering",
    "Manufacturing Engineering",
    "Materials Engineering",
    "Mechanical Engineering",
    "Software Engineering",
  ],
  "Science & Math": [
    "Biochemistry",
    "Biological Sciences",
    "Chemistry",
    "Environmental Earth & Soil Sciences",
    "Kinesiology",
    "Mathematics",
    "Physics",
    "Statistics",
  ],
  "Other Cal Poly majors": [
    "Agricultural Business",
    "Animal Science",
    "Architecture",
    "Art & Design",
    "Business Administration",
    "City & Regional Planning",
    "Communication Studies",
    "Construction Management",
    "Economics",
    "English",
    "Ethnic Studies",
    "Graphic Communication",
    "History",
    "Liberal Studies",
    "Music",
    "Philosophy",
    "Political Science",
    "Psychology",
    "Public Health",
    "Recreation Administration",
    "Sociology",
    "Theatre Arts",
    "Wine and Viticulture",
  ],
};

const spectrum = [
  ["No commitment", "Drop in whenever you want", "mint"],
  ["Low commitment", "Events every once in a while", "yellow"],
  ["Moderate commitment", "A few hours each week", "peach"],
  ["High commitment", "3–5 hours each week", "rose"],
  ["Serious commitment", "6+ hours each week", "coral"],
];

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

    setSubmitting(true);
    setError(null);

    let imageUrl: string | null = null;

    if (imageFile) {
      const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `images/${crypto.randomUUID()}.${extension}`;
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
        tags,
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
      <nav>
        <a className="brand">
          <span>Club</span>Rate
        </a>
        <div className="navlinks">
          <a>Discover clubs</a>
          <a>My dashboard</a>
          <button className="avatar">AR</button>
        </div>
      </nav>
      <section className="page-head">
        <button className="back" onClick={() => pageContext.setPageNum(1)}>
          <ArrowLeft size={18} /> Back to dashboard
        </button>
        <div>
          <p className="eyebrow">CLUB EDITOR</p>
          <h1>Upload your club</h1>
          <p className="subtitle">
            Create a page for your club for others to see and join.
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
              maxLength={240}
            />
            <span className="count">{description.length} / 240</span>
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
                value={tagText}
                onChange={(event) => setTagText(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && (event.preventDefault(), addTag())
                }
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
              Select any majors your club is especially relevant to. Leave blank
              if you welcome everyone.
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
            <span className="step">03</span>
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
