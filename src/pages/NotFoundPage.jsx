import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found | John Gaina'
  }, [])

  return (
    <main className="page detail-page status-page">
      <div className="content-column">
        <Link className="back-link" to="/">
          <ArrowLeft aria-hidden="true" /> Back
        </Link>
        <header className="detail-header">
          <h1 className="detail-title">Page not found</h1>
          <p className="detail-description">The page you requested does not exist.</p>
        </header>
      </div>
    </main>
  )
}
