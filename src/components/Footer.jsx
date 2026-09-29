function Divider() {
  return <div className="divider" role="separator" aria-orientation="horizontal" />
}

export default function Footer({ detail = false }) {
  const year = new Date().getFullYear()
  return (
    <footer className={`site-footer${detail ? ' detail-footer' : ''}`}>
      <Divider />
      <div className="footer-row">
        <div className="social-links">
          <a
            className="text-link"
            href="https://github.com/neavns"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span className="social-separator" aria-hidden="true">
            &middot;
          </span>
          <a
            className="text-link"
            href="https://linkedin.com/in/johngaina"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
        <span className="copyright">&copy; {year}</span>
      </div>
    </footer>
  )
}

export { Divider }
