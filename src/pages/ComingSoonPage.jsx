import Card from '../components/ui/Card'

function ComingSoonPage({ description, title }) {
  return (
    <Card className="coming-soon-page" aria-labelledby="coming-soon-title">
      <p className="status-pill status-pill--success">Proxima fase</p>
      <h2 id="coming-soon-title">{title}</h2>
      <p>{description}</p>
    </Card>
  )
}

export default ComingSoonPage
