import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { useState } from 'react'
import ImageUpload from '../components/ImageUpload'
import CaptionForm from '../components/CaptionForm'
import CaptionResult from '../components/CaptionResult'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const AUDIENCE_SEGMENTS = [
  {
    id: 'creators',
    image: '/images/audiences/creators-and-influencers.png',
    imageAlt: 'A photographer and a social media creator making content',
    title: 'Creators & Influencers',
    shortText: 'Social media copy, asset labels, and story starters.',
    description:
      'Turn visuals into social copy, searchable image-library labels, and a starting point for timely editorial posts.',
    points: [
      'Social media: Draft Instagram, X, or LinkedIn captions for a graphic or photo.',
      'Digital asset management: Add descriptive captions and keywords to help teams find image-library files.',
      'News & journalism: Start with a neutral who, what, and where draft, then verify details before publishing.',
    ],
  },
  {
    id: 'ecommerce',
    image: '/images/audiences/ecommerce-retail.jpg',
    imageAlt: 'A retail shopper and an online shopping experience on a laptop',
    title: 'E-Commerce & Retail',
    shortText: 'Product descriptions, visual search terms, and alt text.',
    description:
      'For online shopping, image captions can support catalog management, product discovery, and a more accessible shopping experience.',
    points: [
      'Product descriptions: Draft clear copy and visible color or style details from a product photo.',
      'Visual search: Suggest descriptive tags shoppers might use to find similar items.',
      'Alt text: Describe product images for screen-reader users and accessible catalogs.',
    ],
  },
  {
    id: 'human-resources',
    image: '/images/audiences/human-resources-corporate-management.avif',
    imageAlt: 'Colleagues working together on corporate communications',
    title: 'Human Resources & Corporate Communications',
    shortText: 'Company event recaps and employee training materials.',
    description:
      'Give workplace photos and process screenshots useful context for internal communications, company pages, and employee resources.',
    points: [
      'Internal event recaps: Draft newsletter or LinkedIn copy for team events and conferences.',
      'Training manuals: Add context to software or hardware screenshots; have a subject-matter expert verify each step.',
    ],
  },
  {
    id: 'healthcare',
    image: '/images/audiences/healthcare-medical-management.avif',
    imageAlt: 'Healthcare professionals reviewing a medical image on a monitor',
    title: 'Healthcare & Medical Imaging',
    shortText: 'Non-diagnostic captions for education and accessibility.',
    description:
      'Use captions to add non-diagnostic context to healthcare visuals. A qualified clinician must review medical descriptions before use.',
    points: [
      'Radiology education: Draft plain-language context for X-ray, MRI, or CT images; this is not a diagnostic report.',
      'Dermatology: Add consistent descriptive context to skin images; clinicians assess and document changes.',
      'Accessibility: Write alt text for medical charts and diagrams, then review clinical terms before sharing.',
    ],
  },
  {
    id: 'small-business',
    image: '/images/audiences/small-business-owners.jpg',
    imageAlt: 'A small-business owner managing a shop and working on a laptop',
    title: 'Small Business Owners',
    shortText: 'Showcase products, services, and the people behind them.',
    description:
      'Help a small business turn everyday photos into clear, welcoming posts that introduce products, share updates, and connect with customers.',
    points: [
      'Write friendly captions for products, services, and new arrivals.',
      'Share promotions, shop updates, and behind-the-scenes moments.',
      'Keep your business social pages active while you focus on customers.',
    ],
  },
  {
    id: 'students',
    image: '/images/audiences/students-and-everyone.webp',
    imageAlt: 'Students and everyday users sharing photos and moments',
    title: 'Students & Everyone',
    shortText: 'Find the right words for school and everyday moments.',
    description:
      'Create captions for class projects, campus events, personal photos, and everyday memories. Start with a draft and make it sound like you.',
    points: [
      'Add context to project images, presentations, and portfolios.',
      'Write natural captions for campus life, trips, and celebrations.',
      'Choose a style and language that fit the moment you want to share.',
    ],
  },
]

const WORKFLOW_STEPS = [
  {
    label: 'Upload',
    title: 'Upload your image',
    description: 'Choose a JPG, PNG, or WEBP photo. Your image gives the caption generator the scene to describe.',
    previewTitle: 'Add an image',
    previewText: 'Select a photo from your device to get started.',
  },
  {
    label: 'Tone',
    title: 'Pick a tone',
    description: 'Choose a short, detailed, funny, Instagram, professional, or alt-text style to fit your post.',
    previewTitle: 'Choose your tone',
    previewText: 'Short · Detailed · Funny · Professional',
  },
  {
    label: 'Context',
    title: 'Let the image set the context',
    description: 'The AI looks at the visual details in your photo and uses them to shape a relevant caption.',
    previewTitle: 'Reading the scene',
    previewText: 'People, objects, setting, and the moment in your image guide the caption.',
  },
  {
    label: 'Language',
    title: 'Choose your language',
    description: 'Create your caption in English, Telugu, or Hindi. Switch languages any time before generating.',
    previewTitle: 'Select a language',
    previewText: 'English · తెలుగు · हिन्दी',
  },
  {
    label: 'Generate',
    title: 'Generate and make it yours',
    description: 'Get a caption draft, copy it, and edit anything you want before sharing it.',
    previewTitle: 'Your caption is ready',
    previewText: 'A little moment, a lot to say. ✨',
  },
]

function Home() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [caption, setCaption] = useState(null)
  const [captionIsGuest, setCaptionIsGuest] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [style, setStyle] = useState('short')
  const [language, setLanguage] = useState('english')
  const [workflowStep, setWorkflowStep] = useState(0)
  const [selectedAudience, setSelectedAudience] = useState(null)

  const handleImageSelect = (file, preview) => {
    setImage(file)
    setImagePreview(preview)
    setCaption(null)
    setCaptionIsGuest(false)
    setError(null)
  }

  const handleImageRemove = () => {
    setImage(null)
    setImagePreview(null)
    setCaption(null)
    setCaptionIsGuest(false)
    setError(null)
  }

  const generateCaption = async (captionStyle = style, captionLanguage = language) => {
    if (!isLoaded) {
      setError('Checking sign-in status. Please try again in a moment.')
      return
    }

    if (!image) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)
    setCaption(null)

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('style', captionStyle)
      formData.append('language', captionLanguage)
      const headers = {}
      if (isSignedIn) {
        const token = await getToken()
        if (!token) {
          throw new Error('Could not verify your sign-in. Please sign in again.')
        }
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/api/caption`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || `Caption request failed (${response.status})`)
      }

      if (typeof data.caption !== 'string' || !data.caption.trim()) {
        throw new Error('Empty response from API')
      }

      setCaption(data.caption.trim())
      setCaptionIsGuest(!isSignedIn)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate caption')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section id="generator" className="scroll-section mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-gray-400">Your photo. The right words.</p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Image Caption Generator
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Turn any image into a caption worth sharing. Choose your tone, pick a language, and let AI find the words.
          </p>
        </div>

        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-700 bg-gray-900 p-4 shadow-2xl shadow-black/30 sm:p-8">
          {isLoaded && !isSignedIn && (
            <div className="generator-start-card mb-5">
              <div className="generator-start-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="16" rx="3" strokeWidth="1.5" />
                  <circle cx="8.5" cy="9" r="1.5" strokeWidth="1.5" />
                  <path d="m4 17 5-5 3 3 3-4 5 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Your next caption starts with a photo</p>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Generate up to 5 captions per hour without an account. Sign in when you want captions saved to your private history.
                </p>
                <ol className="generator-start-steps" aria-label="Caption creation steps">
                  <li><span>01</span> Upload</li>
                  <li><span>02</span> Choose a style</li>
                  <li><span>03</span> Create</li>
                </ol>
              </div>
            </div>
          )}
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={imagePreview}
            onError={setError}
            onRemove={handleImageRemove}
          />

          {imagePreview && (
            <CaptionForm
              onGenerate={generateCaption}
              loading={loading}
              disabled={!image}
              isLoaded={isLoaded}
              isSignedIn={isSignedIn}
              style={style}
              language={language}
              onStyleChange={setStyle}
              onLanguageChange={setLanguage}
            />
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-800 bg-red-950/60 p-4 text-red-200" role="alert">
              <p className="font-semibold">Unable to generate a caption</p>
              <p>{error}</p>
            </div>
          )}

          {caption && (
            <div className="mt-6">
              <CaptionResult
                caption={caption}
                onRegenerate={() => generateCaption()}
                loading={loading}
                isGuest={captionIsGuest}
              />
            </div>
          )}
        </div>
        <p className="mt-5 text-center text-xs text-gray-500">JPG, PNG, or WEBP · Up to 5 MB</p>
      </section>

      <section id="features" className="scroll-section border-y border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Made to say more</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Why use image captions?</h2>
            <p className="mt-4 leading-7 text-gray-400">
              The right caption gives context, adds personality, and helps your image connect with the people who see it.
            </p>
          </div>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(280px,360px)_1fr]">
            <div className="space-y-8">
              <Feature title="AI-powered ideas" text="Go from a blank page to a thoughtful first draft in seconds." />
              <Feature title="Ready for every platform" text="Create copy for Instagram, Facebook, LinkedIn, and more." />
              <Feature title="Your tone, your choice" text="Try short, detailed, funny, professional, or alt-text styles." />
            </div>
            <img
              className="feature-image"
              src="/images/caption-ai-collaboration.png"
              alt="A team using AI and social platforms to create image captions"
              loading="lazy"
              decoding="async"
            />
            <div className="space-y-8">
              <Feature title="Flexible length" text="Keep it brief or add more detail to tell the whole story." />
              <Feature title="Multiple languages" text="Generate captions in English, Telugu, or Hindi." />
              <Feature title="A draft you can make yours" text="Copy, adjust, and share a caption that sounds like you." />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-section mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="workflow-panel">
          <div className="workflow-copy">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Five quick steps</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How it works</h2>
            <p className="mt-4 max-w-md leading-7 text-gray-400">
              From choosing a photo to getting words worth sharing, creating a caption is simple.
            </p>
            <div className="mt-12 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Step {workflowStep + 1} of {WORKFLOW_STEPS.length}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">{WORKFLOW_STEPS[workflowStep].title}</h3>
              <p className="mt-3 leading-7 text-gray-400">{WORKFLOW_STEPS[workflowStep].description}</p>
            </div>
          </div>

          <div className="workflow-demo">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">Image Caption Generator</span>
              <span className="text-xs text-gray-500">{workflowStep + 1} / {WORKFLOW_STEPS.length}</span>
            </div>
            <div className="workflow-tabs mt-5" role="tablist" aria-label="Caption creation steps">
              {WORKFLOW_STEPS.map((step, index) => (
                <button
                  key={step.label}
                  id={`workflow-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={workflowStep === index}
                  aria-controls="workflow-step-preview"
                  onClick={() => setWorkflowStep(index)}
                  className={`workflow-tab ${workflowStep === index ? 'workflow-tab-active' : ''}`}
                >
                  {step.label}
                </button>
              ))}
            </div>
            <div
              id="workflow-step-preview"
              className="workflow-preview"
              role="tabpanel"
              aria-labelledby={`workflow-tab-${workflowStep}`}
            >
              {workflowStep === 0 ? (
                <>
                  <div className="workflow-upload-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.5" />
                      <path d="m4 17 5-5 4 4 3-3 4 4M8 9h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-200">{WORKFLOW_STEPS[workflowStep].previewTitle}</p>
                  <p className="mt-1 max-w-xs text-center text-xs leading-5 text-gray-500">{WORKFLOW_STEPS[workflowStep].previewText}</p>
                </>
              ) : workflowStep === 4 ? (
                <div className="workflow-caption">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{WORKFLOW_STEPS[workflowStep].previewTitle}</p>
                  <p className="mt-3 text-base leading-7 text-gray-100">{WORKFLOW_STEPS[workflowStep].previewText}</p>
                </div>
              ) : (
                <div className="w-full max-w-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{WORKFLOW_STEPS[workflowStep].previewTitle}</p>
                  <p className="mt-4 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm leading-6 text-gray-300">
                    {WORKFLOW_STEPS[workflowStep].previewText}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">A quick guide to your first caption</span>
              {workflowStep < WORKFLOW_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setWorkflowStep((step) => step + 1)}
                  className="rounded-md border border-blue-900 bg-blue-950 px-3 py-2 text-xs font-medium text-blue-100 hover:border-blue-700 hover:bg-blue-900"
                >
                  Next step
                </button>
              ) : (
                <a href="#generator" className="accent-button rounded-md px-3 py-2 text-xs font-semibold">
                  Try it now
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="audience" className="scroll-section border-y border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="For the work behind every image" title="Made for Everyone" />
          <p className="mx-auto mt-4 max-w-2xl text-center leading-7 text-gray-400">
            From social media and product catalogs to small businesses, workplace updates, healthcare education, school projects, and everyday moments, find words that fit.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCE_SEGMENTS.map((segment) => (
              <AudienceCard
                key={segment.id}
                segment={segment}
                active={selectedAudience?.id === segment.id}
                onClick={() => setSelectedAudience((current) => current?.id === segment.id ? null : segment)}
              />
            ))}
          </div>

        </div>
      </section>

      <section id="faq" className="scroll-section mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Good to know" title="Questions, answered" />
        <div className="mt-10 divide-y divide-gray-800 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          <FaqItem question="How does the image caption generator work?" answer="Upload a photo and choose a caption style and language. The image is sent to Groq's vision service to generate a draft, which you can copy or refine." />
          <FaqItem question="Which platforms are the captions suited for?" answer="Use a caption wherever a photo needs words: Instagram, Facebook, LinkedIn, Pinterest, X, blogs, or product pages. Adjust the draft to fit each platform's style before publishing." />
          <FaqItem question="Should the caption just repeat what is in the photo?" answer="No. A caption can add context, tone, or a useful detail that the image alone cannot convey. Review and edit the generated draft so it tells the story you want." />
          <FaqItem question="Can I make the caption sound like my brand?" answer="Yes. Choose a suitable style, then edit the first draft to use your brand's usual words, tone, and phrases." />
          <FaqItem question="What can I use the captions for?" answer="Use them for social posts, blogs, product listings, internal communications, or anywhere an image needs a little context. You can adapt the wording to fit your audience." />
          <FaqItem question="What image formats can I upload?" answer="The generator accepts JPG, PNG, and WEBP images up to 5 MB." />
          <FaqItem question="How well does the AI understand my photo?" answer="It uses visible details to draft a caption, but it can miss context or get details wrong. Check names, events, products, and any sensitive or factual claims before sharing." />
          <FaqItem question="Which languages and styles are available?" answer="Choose English, Telugu, or Hindi, and try short, detailed, funny, Instagram, professional, or alt-text styles." />
          <FaqItem question="Can I edit the caption after it is generated?" answer="Absolutely. Generated captions are a starting point. Copy one and adjust its wording to better match your voice." />
          <FaqItem question="Does the app add a watermark or store my images?" answer="The app does not add a watermark. To generate a caption, the image is sent to Groq's vision service. The app saves the image, caption, style, and language in its SQLite database only when you are signed in. Your history page shows up to 20 recent captions, and deleting an item removes that saved record. Data retention beyond the app depends on the hosting and backup setup." />
        </div>
      </section>

      <section id="watch-demo" className="scroll-section border-y border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="See it in action" title="A caption in just a few steps" />
          <p className="mx-auto mt-4 max-w-2xl text-center leading-7 text-gray-400">
            Watch how to upload a photo, choose a style, and create a caption you can make your own.
          </p>
          <video
            className="mt-10 aspect-video w-full rounded-2xl border border-gray-800 bg-black shadow-2xl"
            controls
            playsInline
            preload="metadata"
            aria-label="Image Caption Generator demo video"
          >
            <source src="/videos/image-caption-generator-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      <footer className="border-t border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <nav aria-label="Quick links" className="footer-quick-links">
            <FooterQuickLink href="#generator" icon="↑" label="Create" />
            <FooterQuickLink href="#features" icon="✦" label="Caption ideas" />
            <FooterQuickLink href="#how-it-works" icon="☷" label="How it works" />
            <FooterQuickLink href="/history" icon="◷" label="History" />
            <FooterQuickLink href="#faq" icon="?" label="Help" />
          </nav>

          <div className="grid gap-10 border-t border-gray-800 pt-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <a href="#generator" className="text-xl font-bold tracking-tight text-white">Image Caption Generator</a>
              <p className="mt-3 max-w-xs leading-6 text-gray-400">
                Turn your images into words worth sharing. Simple, thoughtful captions powered by AI.
              </p>
            </div>
            <FooterLinks title="Explore" links={[
              ['Create a caption', '#generator'],
              ['Why use captions?', '#features'],
              ['How it works', '#how-it-works'],
              ["Who it's for", '#audience'],
            ]} />
            <FooterLinks title="Caption tools" links={[
              ['Choose a tone', '#generator'],
              ['Choose a language', '#generator'],
              ['Caption history', '/history'],
              ['Supported image formats', '#faq'],
            ]} />
            <FooterLinks title="Help" links={[
              ['Frequently asked questions', '#faq'],
              ['Upload an image', '#generator'],
              ['Back to top ↑', '#generator'],
            ]} />
          </div>
          <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            © 2026 Image Caption Generator. Built for creators, businesses, and teams.
          </div>
        </div>
      </footer>
    </main>
  )
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
    </div>
  )
}

function Feature({ title, text }) {
  return (
    <article>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="leading-7 text-gray-400">{text}</p>
    </article>
  )
}

function AudienceCard({ segment, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`audience-card ${active ? 'is-active' : ''}`}
      aria-label={`${segment.title}: ${active ? 'show image' : 'show use cases'}`}
      aria-pressed={active}
    >
      <div className="audience-card-inner">
        <div className="audience-card-face audience-card-front">
          <img className="audience-photo" src={segment.image} alt={segment.imageAlt} loading="lazy" decoding="async" />
          <div className="p-5">
            <h3 className="font-semibold text-white">{segment.title}</h3>
            <p className="mt-1 text-sm text-gray-400">{segment.shortText}</p>
            <p className="mt-3 text-xs font-medium text-gray-500">Select to explore</p>
          </div>
        </div>

        <div className="audience-card-face audience-card-back">
          <div className="audience-card-back-inner">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-300">How they use it</p>
            <h3 className="text-xl font-bold text-white">{segment.title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">{segment.description}</p>
            <ul className="mt-4 space-y-2 text-sm leading-5 text-gray-300">
              {segment.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-400" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </button>
  )
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            {href === '/history' ? (
              <Link className="text-sm text-gray-400 hover:text-white" to={href}>{label}</Link>
            ) : (
              <a className="text-sm text-gray-400 hover:text-white" href={href}>{label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterQuickLink({ href, icon, label }) {
  const content = (
    <>
      <span className="footer-quick-icon" aria-hidden="true">{icon}</span>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </>
  )

  return href === '/history' ? (
    <Link className="footer-quick-link" to={href}>{content}</Link>
  ) : (
    <a className="footer-quick-link" href={href}>{content}</a>
  )
}

function FaqItem({ question, answer }) {
  return (
    <details className="group p-5 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
        {question}
        <span className="text-xl text-gray-500 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <p className="mt-4 max-w-3xl leading-7 text-gray-400">{answer}</p>
    </details>
  )
}

export default Home
