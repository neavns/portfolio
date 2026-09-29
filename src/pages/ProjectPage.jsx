import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import ImageCarousel from '../components/ImageCarousel'
import MarkdownContent from '../components/MarkdownContent'
import projects from '../data/projects.json'

export default function ProjectPage() {
  const { name } = useParams()
  const project = projects.find((candidate) => candidate.name === name)

  useEffect(() => {
    document.title = project ? `${project.title} | John Gaina` : 'Project not found | John Gaina'
  }, [project])

  if (!project) {
    return (
      <main className="page detail-page status-page">
        <div className="content-column">
          <Link className="back-link" to="/">
            <ArrowLeft aria-hidden="true" /> Back
          </Link>
          <header className="detail-header">
            <h1 className="detail-title">Project not found</h1>
            <p className="detail-description">
              That project is not present in the project catalog.
            </p>
          </header>
        </div>
      </main>
    )
  }

  return (
    <main className="page detail-page">
      <div className="content-column">
        <nav aria-label="Breadcrumb">
          <Link className="back-link" to="/">
            <ArrowLeft aria-hidden="true" /> Back
          </Link>
        </nav>

        {/* <header className="detail-header">
          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-description">{project.description}</p>
        </header> */}

        <MarkdownContent source={project.markdown} />

        {project.video && (
          <section className="project-video" aria-labelledby="demo-title">
            <h2 className="markdown-section-heading" id="demo-title">
              Product Demo
            </h2>
            <figure className="project-video-frame">
              <video
                className="project-video-player"
                controls
                playsInline
                preload="metadata"
                poster={project.video.poster}
                aria-label={project.video.title}
              >
                <source src={project.video.src} type={project.video.type} />
                Your browser does not support embedded video.
              </video>
              {project.video.caption && <figcaption>{project.video.caption}</figcaption>}
            </figure>
          </section>
        )}

        {project.images?.length > 0 && (
          <section className="project-gallery" aria-labelledby="screenshots-title">
            <h2 className="markdown-section-heading" id="screenshots-title">
              Screenshots
            </h2>
            <ImageCarousel images={project.images} />
          </section>
        )}

        <Footer detail />
      </div>
    </main>
  )
}
