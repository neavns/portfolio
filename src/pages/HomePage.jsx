import { useEffect, useState } from 'react'
import { CirclePlay, Images } from 'lucide-react'
import { Link } from 'react-router-dom'
import Footer, { Divider } from '../components/Footer'
import projects from '../data/projects.json'
import publicUrl from '../utils/publicUrl'

const orderedProjects = [...projects].sort((first, second) => first.order - second.order)
const projectFilters = ['all', 'professional', 'personal']

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const visibleProjects =
    activeFilter === 'all'
      ? orderedProjects
      : orderedProjects.filter((project) => project.type === activeFilter)

  useEffect(() => {
    document.title = 'John Gaina | Software Engineer'
  }, [])

  return (
    <main className="page home-page">
      <div className="content-column">
        <header className="site-header">
          <a
            className="profile-link"
            href="https://linkedin.com/in/johngaina"
            target="_blank"
            rel="noreferrer"
            aria-label="John Gaina on LinkedIn"
            title="LinkedIn profile"
          >
            <img className="profile-photo" src={publicUrl('/assets/john-gaina.png')} alt="" />
          </a>
          <div className="site-heading">
            <h1 className="site-title">John Gaina</h1>
            <p className="site-subtitle">Senior Software Engineer</p>
          </div>
        </header>

        <section className="intro" aria-label="Introduction">
          <Divider />
          <p>
            I love building stuff... <span className="highlight code-font">with code</span>.
          </p>
        </section>

        <section className="projects-section" aria-labelledby="projects-title">
          <div className="projects-header">
            <h2 className="eyebrow" id="projects-title">
              Projects
            </h2>
            <div className="project-filters" role="group" aria-label="Filter projects">
              {projectFilters.map((filter) => (
                <button
                  className={`project-filter${activeFilter === filter ? ' is-active' : ''}`}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="project-list" key={activeFilter}>
            {visibleProjects.map((project, index) => {
              const imageCount = project.images?.length ?? 0
              const mediaLabel = [
                imageCount > 0 && `${imageCount} image${imageCount === 1 ? '' : 's'}`,
                project.video && 'video',
              ]
                .filter(Boolean)
                .join(' and ')

              return (
                <div
                  className="project-list-item"
                  key={project.name}
                  style={{ '--project-delay': `${100 + index * 70}ms` }}
                >
                  <article className="project-card">
                    <div className="project-header-row">
                      <div className="project-title-group">
                        <Link className="project-title-link" to={`/project/${project.name}`}>
                          {project.title}
                        </Link>
                        {mediaLabel && (
                          <span
                            className="project-media-indicator"
                            role="img"
                            aria-label={`Includes ${mediaLabel}`}
                            title={`Includes ${mediaLabel}`}
                          >
                            {imageCount > 0 && (
                              <span className="project-media-icon" aria-hidden="true">
                                <Images />
                                <span>{imageCount}</span>
                              </span>
                            )}
                            {project.video && <CirclePlay aria-hidden="true" />}
                          </span>
                        )}
                      </div>
                      <time className="project-date">{project.date}</time>
                    </div>
                    <p className="project-summary">{project.summary}</p>
                    <div className="tag-list" aria-label="Technologies">
                      {project.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                  {index < visibleProjects.length - 1 && <Divider />}
                </div>
              )
            })}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
