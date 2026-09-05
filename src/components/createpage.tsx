import { useContext, useRef, useState } from 'react'
import { ArrowLeft, AtSign, Camera, Check, ChevronDown, CircleHelp, Globe2, Plus, ShieldCheck, Users, X } from 'lucide-react'
import '/src/styles/createpagestyle.css'
import { PageContext } from '../PageContext'

const majorGroups = {
  Engineering: ['Aerospace Engineering', 'Architectural Engineering', 'Biomedical Engineering', 'Civil Engineering', 'Computer Engineering', 'Computer Science', 'Electrical Engineering', 'Environmental Engineering', 'General Engineering', 'Industrial Engineering', 'Manufacturing Engineering', 'Materials Engineering', 'Mechanical Engineering', 'Software Engineering'],
  'Science & Math': ['Biochemistry', 'Biological Sciences', 'Chemistry', 'Environmental Earth & Soil Sciences', 'Kinesiology', 'Mathematics', 'Physics', 'Statistics'],
  'Other Cal Poly majors': ['Agricultural Business', 'Animal Science', 'Architecture', 'Art & Design', 'Business Administration', 'City & Regional Planning', 'Communication Studies', 'Construction Management', 'Economics', 'English', 'Ethnic Studies', 'Graphic Communication', 'History', 'Liberal Studies', 'Music', 'Philosophy', 'Political Science', 'Psychology', 'Public Health', 'Recreation Administration', 'Sociology', 'Theatre Arts', 'Wine and Viticulture'],
}

const spectrum = [
  ['No commitment', 'Drop in whenever you want', 'mint'],
  ['Low commitment', 'Events every once in a while', 'yellow'],
  ['Moderate commitment', 'A few hours each week', 'peach'],
  ['High commitment', '3–5 hours each week', 'rose'],
  ['Serious commitment', '6+ hours each week', 'coral'],
]

function CreatePage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>(['Technology'])
  const [tagText, setTagText] = useState('')
  const [majors, setMajors] = useState<string[]>([])
  const [majorOpen, setMajorOpen] = useState(false)
  const [commitment, setCommitment] = useState(2)
  const [created, setCreated] = useState(false)

  const addTag = () => {
    const value = tagText.trim()
    if (value && !tags.includes(value)) setTags([...tags, value])
    setTagText('')
  }
  
  const pageContext = useContext(PageContext);

  return (
    <main>
      <section className="page-head">
        <button className="back" onClick={() => {
          pageContext.setPageNum(1);
        }}><ArrowLeft size={18} /> Return to home</button>
        <div><p className="eyebrow"></p><h1>Add your club</h1><p className="subtitle">Add your club to ClubRate for others to see and rate your club.</p></div>
      </section>
      <section className="layout">
        <div className="form-card">
          <div className="section-title"><span className="step">01</span><div><h2>Basic information</h2><p>Details such as name, image, and club description.</p></div></div>
          <div className="profile-row">
            <button className={'photo ' + (!image ? 'empty' : '')} onClick={() => inputRef.current?.click()}>
              {image ? <span className="photo-image" style={{ backgroundImage: `url(${image})` }} /> : <><Camera size={24} /><b>Add photo</b></>}
            </button>
            <input ref={inputRef} className="sr" type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) setImage(URL.createObjectURL(file)) }} />
            <div><label>Club image</label><p className="muted">Upload an image for your club for others to view at a glance.</p><button className="upload" onClick={() => inputRef.current?.click()}><Camera size={16} /> Upload image</button></div>
          </div>
          <div className="field"><label>Club name <i>Required</i></label><input placeholder="e.g. Cal Poly Robotics" /></div>
          <div className="field"><label>Short description <i>Required</i></label><textarea placeholder="What is your club all about? Keep it welcoming, clear, and specific." maxLength={240} /><span className="count">0 / 240</span></div>
          <div className="field">
            <label>Tags <span className="optional">Optional</span></label><p className="hint">Help students find you. Add topics, interests, or disciplines.</p>
            <div className="tagbox">
              {tags.map(tag => <button className="tag" key={tag}>{tag}<X size={14} onClick={() => setTags(tags.filter(item => item !== tag))} /></button>)}
              <input value={tagText} onChange={event => setTagText(event.target.value)} onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), addTag())} placeholder="Add a tag" />
              <button className="add" onClick={addTag}><Plus size={17} /></button>
            </div>
          </div>
          <div className="field">
            <label>Targeted majors <span className="optional">Optional</span></label><p className="hint">Select any majors your club is especially relevant to. Leave blank if you welcome everyone.</p>
            <button className="select" onClick={() => setMajorOpen(!majorOpen)}>{majors.length ? `${majors.length} major${majors.length > 1 ? 's' : ''} selected` : 'Choose majors'}<ChevronDown size={18} /></button>
            {majorOpen && <div className="major-menu">{Object.entries(majorGroups).map(([group, list]) => <div key={group}><strong>{group}</strong>{list.map(major => <label className="check" key={major}><input type="checkbox" checked={majors.includes(major)} onChange={() => setMajors(majors.includes(major) ? majors.filter(item => item !== major) : [...majors, major])} /><span>{major}</span></label>)}</div>)}</div>}
            {majors.length > 0 && <div className="chosen">{majors.map(major => <button className="tag" key={major}>{major}<X size={14} onClick={() => setMajors(majors.filter(item => item !== major))} /></button>)}</div>}
          </div>
          <div className="section-title lower"><span className="step">02</span><div><h2>What’s the commitment?</h2><p>Set expectations so students know what to expect.</p></div></div>
          <div className="commitment">
            <div className="spectrum">{spectrum.map(([name, description, color], index) => <button key={name} onClick={() => setCommitment(index)} className={'spectrum-card ' + color + (commitment === index ? ' chosen-card' : '')}><span className="radio">{commitment === index && <Check size={13} />}</span><b>{name}</b><small>{description}</small></button>)}</div>
            <input aria-label="Commitment level" type="range" min="0" max="4" step="0.01" value={commitment} onChange={event => setCommitment(Math.round(+event.target.value))} />
            <div className="range-label"><b>{spectrum[commitment][0]}</b><span>{spectrum[commitment][1]}</span></div>
          </div>
          <div className="section-title lower"><span className="step">03</span><div><h2>Ways to connect</h2><p>Add any links you’d like students to use.</p></div></div>
          <div className="contacts"><div className="contact"><AtSign size={18} /><input placeholder="Instagram handle or link" /></div><div className="contact"><Users size={18} /><input placeholder="Discord invite link" /></div><div className="contact"><CircleHelp size={18} /><input placeholder="GroupMe link" /></div><div className="contact"><Globe2 size={18} /><input placeholder="Club website" /></div></div>
          <div className="actions"><p><ShieldCheck size={17} /> You can edit these details anytime.</p><button className="create" onClick={() => setCreated(true)}>{created ? <><Check size={18} /> Club created!</> : 'Create club'}</button></div>
        </div>
      </section>
    </main>
  )
}

export default CreatePage